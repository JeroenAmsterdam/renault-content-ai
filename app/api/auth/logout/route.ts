import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear session cookie
  response.cookies.delete('client_session')

  return response
}
