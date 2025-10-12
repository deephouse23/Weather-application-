import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Throw a test error
    throw new Error('Test Server Error from API Route - This should appear in Sentry!')
  } catch (error) {
    // Manually capture the error
    Sentry.captureException(error)
    
    return NextResponse.json(
      { 
        message: 'Server error thrown and captured by Sentry',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

