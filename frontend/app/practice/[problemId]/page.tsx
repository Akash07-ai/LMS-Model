'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';
import ProblemDescription from '@/components/Practice/ProblemDescription';
import CodeEditor from '@/components/Practice/CodeEditor';
import ConsoleOutput from '@/components/Practice/ConsoleOutput';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  starter_code_js: string;
  starter_code_python: string;
  starter_code_java: string;
  example_input: string;
  example_output: string;
  constraints: string;
}

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [passedTests, setPassedTests] = useState<number>();
  const [totalTests, setTotalTests] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProblem();
  }, [user, params.problemId]);

  useEffect(() => {
    if (problem && language) {
      if (language === 'javascript') {
        setCode(problem.starter_code_js || '// Write your code here');
      } else if (language === 'python') {
        setCode(problem.starter_code_python || '# Write your code here');
      } else if (language === 'java') {
        setCode(problem.starter_code_java || '// Write your code here');
      }
    }
  }, [language, problem]);

  const fetchProblem = async () => {
    try {
      const { data } = await apiClient.get(`/coding/problem/${params.problemId}`);
      setProblem(data);
      setCode(data.starter_code_js || '// Write your code here');
    } catch (error) {
      console.error('Failed to fetch problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleRun = () => {
    setOutput('Running code...\n\n' + code);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput('Submitting...');
    
    try {
      const { data } = await apiClient.post('/coding/submit', {
        problem_id: params.problemId,
        code,
        language
      });

      setStatus(data.status);
      setPassedTests(data.passed_tests);
      setTotalTests(data.total_tests);
      setOutput(`Status: ${data.status}\nPassed: ${data.passed_tests}/${data.total_tests}\nExecution Time: ${data.execution_time}ms`);
    } catch (error: any) {
      setOutput('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (problem && language) {
      if (language === 'javascript') setCode(problem.starter_code_js || '// Write your code here');
      else if (language === 'python') setCode(problem.starter_code_python || '# Write your code here');
      else if (language === 'java') setCode(problem.starter_code_java || '// Write your code here');
    }
    setOutput('');
    setStatus('');
  };

  if (!user || loading) return <div className="p-8">Loading...</div>;
  if (!problem) {
    const [fallbackLang, setFallbackLang] = useState('javascript');
    const boilerplates = {
      javascript: `// JavaScript Boilerplate\nfunction solution() {\n  // Write your code here\n  return null;\n}`,
      python: `# Python Boilerplate\ndef solution():\n    # Write your code here\n    pass`,
      java: `// Java Boilerplate\nclass Solution {\n    public void solution() {\n        // Write your code here\n    }\n}`
    };
    
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/practice')} className="text-blue-600 hover:underline">
            ← Back to Problems
          </button>
          <select
            value={fallbackLang}
            onChange={(e) => setFallbackLang(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </nav>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r p-6 bg-white">
            <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
            <p className="text-gray-600">The problem you're looking for doesn't exist. Here's a boilerplate to get started.</p>
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 border-b bg-gray-900 text-white p-4">
              <pre className="text-sm font-mono">{boilerplates[fallbackLang]}</pre>
            </div>
            <div className="h-48 bg-gray-900 text-white p-4">
              <h3 className="font-semibold mb-2">Console Output</h3>
              <p className="text-sm text-gray-400">Select a valid problem to start coding...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/practice')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Problems
        </button>
        
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          
          <button
            onClick={handleRun}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Run
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r">
          <ProblemDescription
            title={problem.title}
            difficulty={problem.difficulty}
            description={problem.description}
            exampleInput={problem.example_input}
            exampleOutput={problem.example_output}
            constraints={problem.constraints}
          />
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="flex-1 border-b">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
            />
          </div>
          
          <div className="h-48">
            <ConsoleOutput
              output={output}
              status={status}
              passedTests={passedTests}
              totalTests={totalTests}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
