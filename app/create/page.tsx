'use client'

import { useState } from 'react'
import { createArticle } from '@/lib/api-client'
import Link from 'next/link'

export default function CreateArticle() {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('fleet-managers')
  const [keywords, setKeywords] = useState('')
  const [sources, setSources] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await createArticle({
        topic,
        targetAudience: audience,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        sources: sources.split('\n').map(s => s.trim()).filter(Boolean)
      })

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Content creation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-black mb-2">
            Create Content
          </h1>
          <p className="text-gray-600">
            Generate AI-powered content with verified facts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-900">
              Topic
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="topic"
              type="text"
              required
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Renault Trucks E-Tech voor urban distribution"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label htmlFor="audience" className="block text-sm font-medium text-gray-900">
              Target Audience
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="audience"
              required
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="fleet-managers">Fleet Managers</option>
              <option value="truck-drivers">Truck Drivers</option>
              <option value="business-owners">Business Owners</option>
              <option value="logistics-professionals">Logistics Professionals</option>
            </select>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-900">
              Keywords (optioneel)
              <span className="text-sm text-gray-500 font-normal ml-2">
                Komma gescheiden
              </span>
            </label>
            <input
              id="keywords"
              type="text"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., elektrisch, TCO, duurzaamheid"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          {/* Sources - NEW FIELD */}
          <div className="space-y-2">
            <label htmlFor="sources" className="block text-sm font-medium text-gray-900">
              Bronnen (optioneel)
              <span className="text-sm text-gray-500 font-normal ml-2">
                URLs van betrouwbare bronnen
              </span>
            </label>
            <textarea
              id="sources"
              className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://renault-trucks.nl/artikel-1&#10;https://example.com/article-2&#10;&#10;Één URL per regel"
              value={sources}
              onChange={(e) => setSources(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Voeg URLs toe van artikelen, specs, of documentatie.
              Deze bronnen krijgen prioriteit bij fact extraction.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#FFD100] px-8 py-3 font-semibold text-black transition-all hover:bg-[#e6bc00] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating content...' : 'Create Article'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-blue-900 font-medium">
                Creating content... This may take 2-3 minutes
              </p>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Running agents: Research → Validation → Writing → Compliance
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-900 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success State */}
        {result && result.success && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-900 font-semibold mb-4">✅ Article Created Successfully!</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Title:</h4>
                <p className="text-gray-700">{result.article?.title}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Word Count:</h4>
                <p className="text-gray-700">{result.article?.wordCount} words</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Compliance Score:</h4>
                <p className="text-gray-700">{(result.compliance?.overallScore * 100).toFixed(1)}%</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Article ID:</h4>
                <p className="text-gray-700 font-mono text-sm">{result.articleId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
