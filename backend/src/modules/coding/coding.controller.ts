import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { execFile, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ── helpers ──────────────────────────────────────────────────────────────────

function runProcess(cmd: string, args: string[], timeout = 5000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout, maxBuffer: 1024 * 512 }, (err, stdout, stderr) => {
      if (err && err.killed) return reject(new Error('Time Limit Exceeded (5s)'));
      resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

async function executeInSandbox(
  code: string,
  language: string,
  input: string
): Promise<{ output: string; executionTime: number; error: boolean }> {
  const tmpDir = os.tmpdir();
  const startTime = Date.now();

  // ── JavaScript ──────────────────────────────────────────────────────────────
  if (language === 'javascript') {
    const logs: string[] = [];
    const sandboxConsole = {
      log:  (...a: any[]) => logs.push(a.map((x: any) => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
      error:(...a: any[]) => logs.push('ERROR: ' + a.join(' ')),
      warn: (...a: any[]) => logs.push('WARN: '  + a.join(' ')),
    };
    try {
      const fn = new Function('sandboxConsole', `'use strict'; const console = sandboxConsole;\n${code}`);
      await Promise.race([
        new Promise<void>((res, rej) => { try { fn(sandboxConsole); res(); } catch(e){ rej(e); } }),
        new Promise<void>((_, rej) => setTimeout(() => rej(new Error('Time Limit Exceeded (5s)')), 5000))
      ]);
      return {
        output: logs.length ? logs.join('\n') : '(no output — use console.log to print)',
        executionTime: Date.now() - startTime,
        error: false
      };
    } catch (e: any) {
      return { output: e.message, executionTime: Date.now() - startTime, error: true };
    }
  }

  // ── Python ──────────────────────────────────────────────────────────────────
  if (language === 'python') {
    const tmpFile = path.join(tmpDir, `lms_${Date.now()}.py`);
    try {
      fs.writeFileSync(tmpFile, code, 'utf8');
      const { stdout, stderr } = await runProcess('python', [tmpFile]);
      fs.unlinkSync(tmpFile);
      const output = stdout || stderr || '(no output — use print() to show results)';
      return { output: output.trimEnd(), executionTime: Date.now() - startTime, error: !!stderr && !stdout };
    } catch (e: any) {
      try { fs.unlinkSync(tmpFile); } catch {}
      return { output: e.message, executionTime: Date.now() - startTime, error: true };
    }
  }

  // ── Java ────────────────────────────────────────────────────────────────────
  if (language === 'java') {
    // Extract public class name, default to Main
    const classMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';

    // If no class found, wrap code in a Main class automatically
    const finalCode = classMatch ? code : `public class Main {\n  public static void main(String[] args) {\n${code}\n  }\n}`;
    const finalClass = classMatch ? className : 'Main';

    const tmpFile = path.join(tmpDir, `${finalClass}.java`);
    try {
      fs.writeFileSync(tmpFile, finalCode, 'utf8');

      // Compile
      const { stderr: compileErr } = await runProcess('javac', [tmpFile], 10000);
      if (compileErr) {
        try { fs.unlinkSync(tmpFile); } catch {}
        return { output: `Compilation Error:\n${compileErr.trimEnd()}`, executionTime: Date.now() - startTime, error: true };
      }

      // Run
      const { stdout, stderr: runErr } = await runProcess('java', ['-cp', tmpDir, finalClass], 5000);
      // Cleanup .java and .class
      try { fs.unlinkSync(tmpFile); } catch {}
      try { fs.unlinkSync(path.join(tmpDir, `${finalClass}.class`)); } catch {}

      const output = stdout || runErr || '(no output — use System.out.println() to print)';
      return { output: output.trimEnd(), executionTime: Date.now() - startTime, error: !!runErr && !stdout };
    } catch (e: any) {
      try { fs.unlinkSync(tmpFile); } catch {}
      return { output: e.message, executionTime: Date.now() - startTime, error: true };
    }
  }

  return { output: `Language "${language}" is not supported.`, executionTime: 0, error: true };
}

// ── controllers ──────────────────────────────────────────────────────────────
export const getProblemsBySubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    
    const [problems] = await pool.query<RowDataPacket[]>(
      `SELECT id, subject_id, title, difficulty, created_at
       FROM coding_problems
       WHERE subject_id = ?
       ORDER BY difficulty, id`,
      [subjectId]
    );

    res.json({ problems });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    
    const [problems] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM coding_problems WHERE id = ?`,
      [problemId]
    );

    if (problems.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problem = problems[0];
    // Check if test_cases_json is already an object (from DB driver)
    if (typeof problem.test_cases_json === 'string') {
      problem.test_cases_json = JSON.parse(problem.test_cases_json);
    }

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const runCode = async (req: Request, res: Response) => {
  try {
    const { code, language, input } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Missing code or language' });
    const result = await executeInSandbox(code, language, input || '');
    res.json(result);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitCode = async (req: Request, res: Response) => {
  try {
    const { problem_id, code, language } = req.body;
    const userId = req.userId!;

    if (!problem_id || !code || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [problems] = await pool.query<RowDataPacket[]>(
      `SELECT test_cases_json FROM coding_problems WHERE id = ?`,
      [problem_id]
    );

    if (problems.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if test_cases_json is already an object (from DB driver)
    let testCases = problems[0].test_cases_json;
    if (typeof testCases === 'string') {
      testCases = JSON.parse(testCases);
    }
    const result = runTestCases(code, language, testCases);

    await pool.query<ResultSetHeader>(
      `INSERT INTO coding_submissions (user_id, problem_id, code, language, status, execution_time, passed_tests, total_tests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, problem_id, code, language, result.status, result.execution_time, result.passed_tests, result.total_tests]
    );

    res.json(result);
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function runTestCases(code: string, language: string, testCases: any[]) {
  let passedTests = 0;
  const totalTests = testCases.length;
  const startTime = Date.now();

  try {
    for (const testCase of testCases) {
      const result = executeCode(code, language, testCase.input);
      if (JSON.stringify(result) === JSON.stringify(testCase.output)) {
        passedTests++;
      }
    }

    const executionTime = Date.now() - startTime;
    const status = passedTests === totalTests ? 'Accepted' : 'Wrong Answer';

    return {
      status,
      passed_tests: passedTests,
      total_tests: totalTests,
      execution_time: executionTime
    };
  } catch (error: any) {
    return {
      status: 'Runtime Error',
      passed_tests: passedTests,
      total_tests: totalTests,
      execution_time: Date.now() - startTime,
      error: error.message
    };
  }
}

function executeCode(code: string, language: string, input: any): any {
  if (language === 'javascript') {
    try {
      const func = new Function('input', `${code}\nreturn ${extractFunctionName(code)}(${formatInput(input)});`);
      return func(input);
    } catch (error) {
      throw error;
    }
  }
  
  throw new Error('Language not supported for execution');
}

function extractFunctionName(code: string): string {
  const match = code.match(/function\s+(\w+)/);
  return match ? match[1] : 'solution';
}

function formatInput(input: any): string {
  if (typeof input === 'object') {
    return Object.values(input).map(v => JSON.stringify(v)).join(', ');
  }
  return JSON.stringify(input);
}

export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { problemId } = req.params;

    const [submissions] = await pool.query<RowDataPacket[]>(
      `SELECT id, problem_id, language, status, passed_tests, total_tests, execution_time, submitted_at
       FROM coding_submissions
       WHERE user_id = ? AND problem_id = ?
       ORDER BY submitted_at DESC
       LIMIT 10`,
      [userId, problemId]
    );

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
