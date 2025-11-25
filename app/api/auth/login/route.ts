import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }
  }
)

export async function POST(request: Request) {
  try {
    const { clientName, password } = await request.json()

    console.log('🔐 Login attempt for:', clientName)

    // Find client by name (case-insensitive)
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .ilike('name', clientName)
      .single()

    if (error || !client) {
      console.error('❌ Client not found:', clientName)
      return NextResponse.json(
        { success: false, error: 'Organisatie niet gevonden' },
        { status: 401 }
      )
    }

    console.log('✓ Client found:', client.name)

    // Verify password
    const validPassword = await bcrypt.compare(password, client.password_hash)

    if (!validPassword) {
      console.error('❌ Invalid password for:', clientName)
      return NextResponse.json(
        { success: false, error: 'Incorrect wachtwoord' },
        { status: 401 }
      )
    }

    console.log('✅ Login successful for:', client.name)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        brandSettings: client.brand_settings
      }
    })

    // Set secure session cookie
    response.cookies.set('client_session', client.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
