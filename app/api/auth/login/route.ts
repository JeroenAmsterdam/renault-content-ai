import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { clientName, password } = await request.json()

    if (!clientName || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Find client by name
    const { data: client, error } = await (supabaseAdmin
      .from('clients') as any)
      .select('*')
      .eq('name', clientName)
      .single()

    if (error || !client) {
      console.error('Client not found:', clientName)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // TODO: Add bcrypt password verification
    // For now, store passwords as plain text in migration
    // In production, use: await bcrypt.compare(password, client.password_hash)

    // Temporary simple check (CHANGE THIS IN PRODUCTION!)
    const validPassword = password === 'renault2025' // Hardcoded for demo

    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        brandSettings: client.brand_settings
      }
    })

    // Set secure HTTP-only cookie
    response.cookies.set('client_session', client.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
