'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-weather-bg-elev flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-weather-text mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="text-weather-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  )
}