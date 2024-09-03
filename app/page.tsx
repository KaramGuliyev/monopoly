export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Monopoly Digital Bank</h1>
        <p className="text-xl mb-8 text-center max-w-2xl">
          Welcome to the future of Monopoly! Play with digital currency, manage transactions in real-time, and enjoy a seamless
          gaming experience.
        </p>
        <div className="flex space-x-4">
          <a
            href="/api/auth/signin"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Register
          </a>
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Key Features:</h2>
          <ul className="list-disc list-inside text-left max-w-md mx-auto">
            <li>Real-time transaction updates</li>
            <li>Create or join games with a unique code</li>
            <li>Secure player-to-player transfers</li>
            <li>View all players financial status</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
