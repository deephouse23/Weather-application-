"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  componentName?: string
  className?: string
  theme?: 'dark' | 'miami' | 'tron'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private getThemeClasses() {
    const { theme = 'dark' } = this.props
    
    switch (theme) {
      case 'miami':
        return {
          container: 'bg-[#0a0025] border-[#ff1493] text-[#00ffff]',
          button: 'bg-[#ff1493] text-[#0a0025] hover:bg-[#ff69b4]',
          icon: 'text-[#ff1493]',
          text: 'text-[#00ffff]'
        }
      case 'tron':
        return {
          container: 'bg-black border-[#00FFFF] text-white',
          button: 'bg-[#00FFFF] text-black hover:bg-[#00DCFF]',
          icon: 'text-[#00FFFF]',
          text: 'text-white'
        }
      default: // dark
        return {
          container: 'bg-[#0f0f0f] border-[#00d4ff] text-[#e0e0e0]',
          button: 'bg-[#00d4ff] text-[#0f0f0f] hover:bg-[#00b8e6]',
          icon: 'text-[#00d4ff]',
          text: 'text-[#e0e0e0]'
        }
    }
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback, componentName, className } = this.props
    const themeClasses = this.getThemeClasses()

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div className={cn(
          "flex flex-col items-center justify-center p-6 border-2 rounded-lg",
          "min-h-[200px] max-w-lg mx-auto font-mono",
          themeClasses.container,
          className
        )}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className={cn("w-6 h-6", themeClasses.icon)} />
            <h2 className="text-lg font-bold uppercase tracking-wider">
              Component Error
            </h2>
          </div>
          
          <div className="text-center mb-6">
            <p className={cn("text-sm mb-2", themeClasses.text)}>
              {componentName ? `Error in ${componentName}` : 'Something went wrong'}
            </p>
            {error && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                  Show Error Details
                </summary>
                <pre className="text-xs mt-2 p-2 bg-black/20 rounded overflow-auto max-h-32">
                  {error.message}
                </pre>
              </details>
            )}
          </div>

          <button
            onClick={this.handleRetry}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded font-medium",
              "transition-colors duration-200 text-sm uppercase tracking-wider",
              themeClasses.button
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )
    }

    return children
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Safe render component for conditional rendering
export function SafeRender({ 
  children, 
  fallback = null, 
  condition = true 
}: { 
  children: ReactNode
  fallback?: ReactNode
  condition?: boolean 
}) {
  try {
    return condition ? <>{children}</> : <>{fallback}</>
  } catch (error) {
    console.error('SafeRender error:', error)
    return <>{fallback}</>
  }
}