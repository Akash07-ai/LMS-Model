export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LMS Platform</h1>
        <p className="text-gray-600 mb-8">Learning Management System</p>
        <div className="space-x-4">
          <a href="/auth/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </a>
          <a href="/auth/register" className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
