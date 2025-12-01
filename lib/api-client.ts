/**
 * API Client - Frontend helper functions
 *
 * Type-safe client for interacting with the REST API endpoints.
 * Use these functions in React components and frontend code.
 */

export async function createArticle(data: {
  topic: string
  targetAudience: string
  keywords?: string[]
  desiredWordCount?: number
  sources?: string[]
  briefing?: string
}) {
  const response = await fetch('/api/content/create', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return response.json()
}

export async function getArticles(params?: {
  status?: string
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`/api/articles?${searchParams}`)
  return response.json()
}

export async function getArticle(id: string) {
  const response = await fetch(`/api/articles/${id}`)
  return response.json()
}

export async function updateArticle(id: string, data: any) {
  const response = await fetch(`/api/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}

export async function deleteArticle(id: string) {
  const response = await fetch(`/api/articles/${id}`, {
    method: 'DELETE'
  })
  return response.json()
}

export async function getStats() {
  const response = await fetch('/api/stats')
  return response.json()
}
