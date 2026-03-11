interface ProblemDescriptionProps {
  title: string;
  difficulty: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
}

export default function ProblemDescription({ title, difficulty, description, exampleInput, exampleOutput, constraints }: ProblemDescriptionProps) {
  return (
    <div className="h-full overflow-y-auto p-6 bg-white">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-700 whitespace-pre-line">{description}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Example</h3>
        <div className="bg-gray-50 p-4 rounded border">
          <p className="mb-2"><strong>Input:</strong></p>
          <code className="text-sm">{exampleInput}</code>
          <p className="mt-3 mb-2"><strong>Output:</strong></p>
          <code className="text-sm">{exampleOutput}</code>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Constraints</h3>
        <p className="text-gray-700 text-sm whitespace-pre-line">{constraints}</p>
      </div>
    </div>
  );
}
