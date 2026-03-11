import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
