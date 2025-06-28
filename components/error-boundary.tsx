'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} />
      }

      return (
        <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-lg font-mono mb-4">SYSTEM ERROR</div>
            <div className="text-cyan-600 text-sm font-mono mb-6">
              An unexpected error occurred. Please refresh the page.
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-cyan-500 text-black font-mono text-sm px-6 py-3 
                       hover:bg-cyan-400 transition-all duration-200 
                       uppercase tracking-wider inline-block"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 