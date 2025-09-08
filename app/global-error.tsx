'use client'

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export const runtime = 'nodejs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
            <p className="text-gray-300 mb-6">An unexpected error occurred</p>
            <button
              onClick={() => reset()}
              className="text-blue-400 hover:underline px-4 py-2 border border-blue-400 rounded mr-4"
            >
              Try again
            </button>
            <a href="/" className="text-blue-400 hover:underline px-4 py-2 border border-blue-400 rounded">
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}