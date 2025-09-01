import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication, redirect to the next URL or home
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('Auth callback error:', error)
      // Redirect to login with error
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed', request.url)
      )
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}