/**
 * Supabase Client Configuration
 *
 * This file provides two Supabase clients:
 * 1. supabase - Client-side client with anon key (use in browser/client components)
 * 2. supabaseAdmin - Server-side client with service role key (use in API routes/server actions)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Lazy-loaded client instances
let _supabase: SupabaseClient<Database> | null = null
let _supabaseAdmin: SupabaseClient<Database> | null = null

/**
 * Get Supabase client instance (lazy loaded)
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    }

    if (!supabaseAnonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    }

    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return _supabase
}

/**
 * Client-side Supabase client
 * Use this in client components and browser code
 * Has limited permissions based on Row Level Security (RLS) policies
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient<Database>]
  },
})

/**
 * Get Supabase admin client instance (lazy loaded)
 * Server-side client with service role key
 *
 * Use this ONLY in:
 * - API routes (app/api/*)
 * - Server actions
 * - Server components
 *
 * WARNING: Never expose this client to the browser!
 * It bypasses Row Level Security (RLS) policies
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    }

    if (!supabaseServiceRoleKey) {
      throw new Error(
        'Supabase admin client not available. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.'
      )
    }

    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

/**
 * Helper function to handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Supabase error: ${error.message}`)
  }
  throw new Error('Unknown Supabase error occurred')
}

/**
 * Type-safe response handler
 */
export function unwrapSupabaseResponse<T>(
  response: { data: T | null; error: Error | null }
): T {
  if (response.error) {
    handleSupabaseError(response.error)
  }
  if (!response.data) {
    throw new Error('No data returned from Supabase')
  }
  return response.data
}
