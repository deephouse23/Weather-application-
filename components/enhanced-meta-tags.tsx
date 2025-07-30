/**
 * Enhanced Meta Tags Component
 * Comprehensive SEO and social sharing optimization
 */

interface MetaTagsProps {
  title: string
  description: string
  url: string
  cityName: string
  cityState: string
  type?: 'website' | 'article'
  publishedTime?: string
}

export function EnhancedMetaTags({ 
  title, 
  description, 
  url, 
  cityName, 
  cityState,
  type = 'website',
  publishedTime 
}: MetaTagsProps) {
  const siteName = '16-Bit Weather'
  const domain = 'https://www.16bitweather.co'
  const ogImageUrl = `${domain}/api/og?city=${encodeURIComponent(cityName)}&state=${cityState}`
  
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:alt" content={`${cityName} weather forecast in retro 16-bit style`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={`${cityName} weather forecast in retro 16-bit style`} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content={`US-${cityState}`} />
      <meta name="geo.placename" content={`${cityName}, ${cityState}`} />
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={siteName} />
          <meta property="article:section" content="Weather" />
          <meta property="article:tag" content="weather forecast" />
          <meta property="article:tag" content="16-bit" />
          <meta property="article:tag" content={cityName} />
        </>
      )}
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://api.openweathermap.org" />
      <link rel="preconnect" href="https://pollen.googleapis.com" />
      
      {/* DNS prefetch for performance */}
      <link rel="dns-prefetch" href="https://api.openweathermap.org" />
      <link rel="dns-prefetch" href="https://pollen.googleapis.com" />
    </>
  )
}