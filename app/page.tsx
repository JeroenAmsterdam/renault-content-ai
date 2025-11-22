import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <main className="flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16">
        {/* Header with Renault Trucks branding */}
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-black">
            Renault Trucks Content System
          </h1>
          <div className="mx-auto h-1 w-24 bg-[#FFD100]"></div>
        </div>

        {/* Description */}
        <p className="max-w-2xl text-center text-lg text-gray-700">
          A multi-agent AI system for creating, managing, and optimizing content
          for Renault Trucks. Powered by Claude AI agents working together to
          deliver high-quality trucking industry content.
        </p>

        {/* Feature highlights */}
        <div className="grid w-full max-w-3xl gap-6 pt-8 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-2 font-semibold text-black">Multi-Agent System</h3>
            <p className="text-sm text-gray-600">
              Specialized AI agents collaborate to create comprehensive content
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-2 font-semibold text-black">Content Creation</h3>
            <p className="text-sm text-gray-600">
              Generate articles, marketing copy, and technical documentation
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-2 font-semibold text-black">Quality Assured</h3>
            <p className="text-sm text-gray-600">
              Built-in review and optimization processes ensure top quality
            </p>
          </div>
        </div>

        {/* CTA Button - Dashboard link for later */}
        <div className="pt-8">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#FFD100] px-8 py-3 font-semibold text-black transition-all hover:bg-[#e6bc00] hover:shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Status note */}
        <p className="pt-4 text-sm text-gray-500">
          System is ready for agent integration
        </p>
      </main>
    </div>
  );
}
