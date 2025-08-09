'use client'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-weather-bg-elev flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-weather-text mb-4">Not Found</h2>
        <p className="text-weather-text mb-6">Could not find requested resource</p>
        <a href="/" className="text-weather-primary hover:underline">
          Return Home
        </a>
      </div>
    </div>
  )
}