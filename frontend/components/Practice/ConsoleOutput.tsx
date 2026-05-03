interface ConsoleOutputProps {
  output: string;
  status?: string;
  passedTests?: number;
  totalTests?: number;
  executionTime?: number;
}

export default function ConsoleOutput({ output, status, passedTests, totalTests, executionTime }: ConsoleOutputProps) {
  const isError = status === 'error';
  const isAccepted = status === 'Accepted' || status === 'success';

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="font-semibold text-sm text-gray-300">Console Output</h3>
        <div className="flex items-center gap-2">
          {executionTime !== undefined && (
            <span className="text-xs text-gray-500">{executionTime}ms</span>
          )}
          {status && status !== 'error' && status !== 'success' && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              isAccepted ? 'bg-green-600/80 text-green-100' :
              status === 'Wrong Answer' ? 'bg-red-600/80 text-red-100' :
              'bg-yellow-600/80 text-yellow-100'
            }`}>
              {status}
            </span>
          )}
        </div>
      </div>

      {passedTests !== undefined && totalTests !== undefined && (
        <div className="mb-2 text-xs flex items-center gap-2">
          <span className="text-gray-400">Test Cases:</span>
          <span className={passedTests === totalTests ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
            {passedTests}/{totalTests} passed
          </span>
        </div>
      )}

      <pre className={`text-sm font-mono whitespace-pre-wrap flex-1 ${
        isError ? 'text-red-400' : isAccepted ? 'text-green-300' : 'text-gray-200'
      }`}>
        {output || 'Click ▶ Run to execute your code...'}
      </pre>
    </div>
  );
}
