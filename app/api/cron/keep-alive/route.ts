import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { PLACEHOLDER_URL, PLACEHOLDER_SERVICE_KEY } from '@/lib/supabase/constants'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return new Response('CRON_SECRET not configured', { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_SERVICE_KEY

  if (supabaseUrl === PLACEHOLDER_URL) {
    return Response.json(
      { success: false, error: 'Supabase not configured' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  if (error) {
    console.error('[cron/keep-alive] Database ping failed:', error.message)
    return Response.json(
      { success: false, error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Database is alive',
  })
}
