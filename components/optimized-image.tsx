/**
 * Optimized Image Component
 * Provides lazy loading, proper alt text, and performance optimization
 */

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn("relative", className)}>
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        // Fallback for broken images
        <div 
          className={cn(
            "flex items-center justify-center bg-gray-200 text-gray-500 text-sm",
            "border border-gray-300 rounded"
          )}
          style={{ width, height }}
        >
          Image not available
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && !error && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse rounded",
            "flex items-center justify-center text-gray-400 text-xs"
          )}
        >
          Loading...
        </div>
      )}
    </div>
  )
}

// Weather icon component with optimized loading
export function WeatherIcon({ 
  iconCode, 
  size = 64, 
  className 
}: { 
  iconCode: string
  size?: number
  className?: string 
}) {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  const altText = `Weather icon: ${iconCode}`
  
  return (
    <OptimizedImage
      src={iconUrl}
      alt={altText}
      width={size}
      height={size}
      className={className}
      sizes="(max-width: 768px) 48px, 64px"
      placeholder="empty"
    />
  )
}