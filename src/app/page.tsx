export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          E2E Verify Mar26b
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          End-to-end deployment verification
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-400 transition"
          >
            Get Started
          </a>
          <a
            href="/api/health"
            className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-gray-500 transition"
          >
            API Status
          </a>
        </div>
      </div>
      <footer className="mt-16 text-sm text-gray-600">
        Powered by <a href="https://jarvissdk.com" className="text-cyan-500 hover:underline">JarvisSDK</a>
      </footer>
    </main>
  );
}
