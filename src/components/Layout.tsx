import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-weather-bg text-weather-text">
      <main>
        {children}
      </main>
    </div>
  )
}