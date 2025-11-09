import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
      <main className="text-center max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-6xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Assistant Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unleash your creativity with AI-powered image generation and
            intelligent chat conversations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/create-image"
            className="group relative px-8 py-4 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="relative z-10">🎨 Create Image</span>
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href="/chat"
            className="group relative px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="relative z-10">💬 Chat with AI</span>
            <div className="absolute inset-0 bg-linear-to-r from-green-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </main>
    </div>
  );
}
