interface ConsoleOutputProps {
  output: string;
  status?: string;
  passedTests?: number;
  totalTests?: number;
}

export default function ConsoleOutput({ output, status, passedTests, totalTests }: ConsoleOutputProps) {
  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Console Output</h3>
        {status && (
          <span className={`px-3 py-1 rounded text-sm font-semibold ${
            status === 'Accepted' ? 'bg-green-600' :
            status === 'Wrong Answer' ? 'bg-red-600' :
            'bg-yellow-600'
          }`}>
            {status}
          </span>
        )}
      </div>
      
      {passedTests !== undefined && totalTests !== undefined && (
        <div className="mb-3 text-sm">
          <span className="text-gray-400">Test Cases: </span>
          <span className={passedTests === totalTests ? 'text-green-400' : 'text-red-400'}>
            {passedTests}/{totalTests} passed
          </span>
        </div>
      )}
      
      <pre className="text-sm font-mono whitespace-pre-wrap">
        {output || 'Run your code to see output...'}
      </pre>
    </div>
  );
}
