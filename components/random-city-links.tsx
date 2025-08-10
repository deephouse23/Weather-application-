"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Complete list of top 100+ US cities for SEO
export const ALL_CITIES = [
  // Existing cities
  { slug: 'new-york-ny', name: 'NEW YORK', state: 'NY' },
  { slug: 'los-angeles-ca', name: 'LOS ANGELES', state: 'CA' },
  { slug: 'chicago-il', name: 'CHICAGO', state: 'IL' },
  { slug: 'houston-tx', name: 'HOUSTON', state: 'TX' },
  { slug: 'phoenix-az', name: 'PHOENIX', state: 'AZ' },
  { slug: 'philadelphia-pa', name: 'PHILADELPHIA', state: 'PA' },
  { slug: 'san-antonio-tx', name: 'SAN ANTONIO', state: 'TX' },
  { slug: 'san-diego-ca', name: 'SAN DIEGO', state: 'CA' },
  { slug: 'dallas-tx', name: 'DALLAS', state: 'TX' },
  { slug: 'austin-tx', name: 'AUSTIN', state: 'TX' },
  
  // Additional major cities
  { slug: 'san-jose-ca', name: 'SAN JOSE', state: 'CA' },
  { slug: 'jacksonville-fl', name: 'JACKSONVILLE', state: 'FL' },
  { slug: 'fort-worth-tx', name: 'FORT WORTH', state: 'TX' },
  { slug: 'columbus-oh', name: 'COLUMBUS', state: 'OH' },
  { slug: 'charlotte-nc', name: 'CHARLOTTE', state: 'NC' },
  { slug: 'indianapolis-in', name: 'INDIANAPOLIS', state: 'IN' },
  { slug: 'san-francisco-ca', name: 'SAN FRANCISCO', state: 'CA' },
  { slug: 'seattle-wa', name: 'SEATTLE', state: 'WA' },
  { slug: 'denver-co', name: 'DENVER', state: 'CO' },
  { slug: 'washington-dc', name: 'WASHINGTON', state: 'DC' },
  { slug: 'boston-ma', name: 'BOSTON', state: 'MA' },
  { slug: 'el-paso-tx', name: 'EL PASO', state: 'TX' },
  { slug: 'nashville-tn', name: 'NASHVILLE', state: 'TN' },
  { slug: 'detroit-mi', name: 'DETROIT', state: 'MI' },
  { slug: 'oklahoma-city-ok', name: 'OKLAHOMA CITY', state: 'OK' },
  { slug: 'portland-or', name: 'PORTLAND', state: 'OR' },
  { slug: 'las-vegas-nv', name: 'LAS VEGAS', state: 'NV' },
  { slug: 'memphis-tn', name: 'MEMPHIS', state: 'TN' },
  { slug: 'louisville-ky', name: 'LOUISVILLE', state: 'KY' },
  { slug: 'baltimore-md', name: 'BALTIMORE', state: 'MD' },
  { slug: 'milwaukee-wi', name: 'MILWAUKEE', state: 'WI' },
  { slug: 'albuquerque-nm', name: 'ALBUQUERQUE', state: 'NM' },
  { slug: 'tucson-az', name: 'TUCSON', state: 'AZ' },
  { slug: 'fresno-ca', name: 'FRESNO', state: 'CA' },
  { slug: 'sacramento-ca', name: 'SACRAMENTO', state: 'CA' },
  { slug: 'kansas-city-mo', name: 'KANSAS CITY', state: 'MO' },
  { slug: 'long-beach-ca', name: 'LONG BEACH', state: 'CA' },
  { slug: 'mesa-az', name: 'MESA', state: 'AZ' },
  { slug: 'atlanta-ga', name: 'ATLANTA', state: 'GA' },
  { slug: 'colorado-springs-co', name: 'COLORADO SPRINGS', state: 'CO' },
  { slug: 'virginia-beach-va', name: 'VIRGINIA BEACH', state: 'VA' },
  { slug: 'raleigh-nc', name: 'RALEIGH', state: 'NC' },
  { slug: 'omaha-ne', name: 'OMAHA', state: 'NE' },
  { slug: 'miami-fl', name: 'MIAMI', state: 'FL' },
  { slug: 'oakland-ca', name: 'OAKLAND', state: 'CA' },
  { slug: 'minneapolis-mn', name: 'MINNEAPOLIS', state: 'MN' },
  { slug: 'tulsa-ok', name: 'TULSA', state: 'OK' },
  { slug: 'wichita-ks', name: 'WICHITA', state: 'KS' },
  { slug: 'new-orleans-la', name: 'NEW ORLEANS', state: 'LA' },
  
  // Additional cities for broader coverage
  { slug: 'cleveland-oh', name: 'CLEVELAND', state: 'OH' },
  { slug: 'tampa-fl', name: 'TAMPA', state: 'FL' },
  { slug: 'aurora-co', name: 'AURORA', state: 'CO' },
  { slug: 'honolulu-hi', name: 'HONOLULU', state: 'HI' },
  { slug: 'anaheim-ca', name: 'ANAHEIM', state: 'CA' },
  { slug: 'santa-ana-ca', name: 'SANTA ANA', state: 'CA' },
  { slug: 'st-louis-mo', name: 'ST LOUIS', state: 'MO' },
  { slug: 'riverside-ca', name: 'RIVERSIDE', state: 'CA' },
  { slug: 'corpus-christi-tx', name: 'CORPUS CHRISTI', state: 'TX' },
  { slug: 'pittsburgh-pa', name: 'PITTSBURGH', state: 'PA' },
  { slug: 'lexington-ky', name: 'LEXINGTON', state: 'KY' },
  { slug: 'anchorage-ak', name: 'ANCHORAGE', state: 'AK' },
  { slug: 'stockton-ca', name: 'STOCKTON', state: 'CA' },
  { slug: 'cincinnati-oh', name: 'CINCINNATI', state: 'OH' },
  { slug: 'st-paul-mn', name: 'ST PAUL', state: 'MN' },
  { slug: 'toledo-oh', name: 'TOLEDO', state: 'OH' },
  { slug: 'greensboro-nc', name: 'GREENSBORO', state: 'NC' },
  { slug: 'newark-nj', name: 'NEWARK', state: 'NJ' },
  { slug: 'plano-tx', name: 'PLANO', state: 'TX' },
  { slug: 'henderson-nv', name: 'HENDERSON', state: 'NV' },
  { slug: 'lincoln-ne', name: 'LINCOLN', state: 'NE' },
  { slug: 'buffalo-ny', name: 'BUFFALO', state: 'NY' },
  { slug: 'jersey-city-nj', name: 'JERSEY CITY', state: 'NJ' },
  { slug: 'chula-vista-ca', name: 'CHULA VISTA', state: 'CA' },
  { slug: 'fort-wayne-in', name: 'FORT WAYNE', state: 'IN' },
  { slug: 'orlando-fl', name: 'ORLANDO', state: 'FL' },
  { slug: 'st-petersburg-fl', name: 'ST PETERSBURG', state: 'FL' },
  { slug: 'chandler-az', name: 'CHANDLER', state: 'AZ' },
  { slug: 'laredo-tx', name: 'LAREDO', state: 'TX' },
  { slug: 'norfolk-va', name: 'NORFOLK', state: 'VA' },
  { slug: 'durham-nc', name: 'DURHAM', state: 'NC' },
  { slug: 'madison-wi', name: 'MADISON', state: 'WI' },
  { slug: 'lubbock-tx', name: 'LUBBOCK', state: 'TX' },
  { slug: 'irvine-ca', name: 'IRVINE', state: 'CA' },
  { slug: 'winston-salem-nc', name: 'WINSTON-SALEM', state: 'NC' },
  { slug: 'glendale-az', name: 'GLENDALE', state: 'AZ' },
  { slug: 'garland-tx', name: 'GARLAND', state: 'TX' },
  { slug: 'hialeah-fl', name: 'HIALEAH', state: 'FL' },
  { slug: 'reno-nv', name: 'RENO', state: 'NV' },
  { slug: 'chesapeake-va', name: 'CHESAPEAKE', state: 'VA' },
  { slug: 'gilbert-az', name: 'GILBERT', state: 'AZ' },
  { slug: 'baton-rouge-la', name: 'BATON ROUGE', state: 'LA' },
  { slug: 'irving-tx', name: 'IRVING', state: 'TX' },
  { slug: 'scottsdale-az', name: 'SCOTTSDALE', state: 'AZ' },
  { slug: 'north-las-vegas-nv', name: 'NORTH LAS VEGAS', state: 'NV' },
  { slug: 'fremont-ca', name: 'FREMONT', state: 'CA' },
  { slug: 'boise-id', name: 'BOISE', state: 'ID' },
  { slug: 'richmond-va', name: 'RICHMOND', state: 'VA' },
  { slug: 'san-bernardino-ca', name: 'SAN BERNARDINO', state: 'CA' },
  { slug: 'spokane-wa', name: 'SPOKANE', state: 'WA' },
]

interface RandomCityLinksProps {
  theme?: 'dark' | 'miami' | 'tron'
}

export default function RandomCityLinks({ theme = 'dark' }: RandomCityLinksProps) {
  const [displayedCities, setDisplayedCities] = useState<typeof ALL_CITIES>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Shuffle and select 10 random cities
    const shuffled = [...ALL_CITIES].sort(() => Math.random() - 0.5)
    setDisplayedCities(shuffled.slice(0, 10))
    setIsLoading(false)
  }, [])

  const handleRefresh = () => {
    const shuffled = [...ALL_CITIES].sort(() => Math.random() - 0.5)
    setDisplayedCities(shuffled.slice(0, 10))
  }

  if (isLoading) {
    return (
      <div className={cn(
        "mt-16 pt-8 border-t-2 text-center",
        theme === "dark" && "border-[#00d4ff]",
        theme === "miami" && "border-[#ff1493]",
        theme === "tron" && "border-[#00FFFF]"
      )}>
        <div className="animate-pulse text-weather-text">Loading cities...</div>
      </div>
    )
  }

  return (
    <div className={cn(
      "mt-16 pt-8 border-t-2 text-center",
      theme === "dark" && "border-[#00d4ff]",
      theme === "miami" && "border-[#ff1493]",
      theme === "tron" && "border-[#00FFFF]"
    )}>
      <div className="flex items-center justify-center gap-4 mb-4">
        <h2 className={cn(
          "text-lg font-bold uppercase tracking-wider font-mono",
          theme === "dark" && "text-[#00d4ff]",
          theme === "miami" && "text-[#ff1493]",
          theme === "tron" && "text-[#00FFFF]"
        )}>
          WEATHER BY CITY
        </h2>
        <button
          onClick={handleRefresh}
          className={cn(
            "px-3 py-1 text-xs font-mono rounded border transition-all duration-200",
            theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] bg-[#00d4ff]/20 hover:bg-[#00d4ff]/40",
            theme === "miami" && "border-[#ff1493] text-[#00ffff] bg-[#ff1493]/20 hover:bg-[#ff1493]/40",
            theme === "tron" && "border-[#00FFFF] text-white bg-[#00FFFF]/20 hover:bg-[#00FFFF]/40"
          )}
          title="Show different cities"
          aria-label="Shuffle cities"
        >
          ↻ SHUFFLE
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
        {displayedCities.map((city) => (
          <Link
            key={city.slug}
            href={`/weather/${city.slug}`}
            className={cn(
              "block px-3 py-2 text-sm font-mono rounded border transition-all duration-200",
              theme === "dark" && "border-[#00d4ff] text-[#e0e0e0] hover:bg-[#00d4ff] hover:text-[#0f0f0f]",
              theme === "miami" && "border-[#ff1493] text-[#00ffff] hover:bg-[#ff1493] hover:text-[#0a0025]",
              theme === "tron" && "border-[#00FFFF] text-white hover:bg-[#00FFFF] hover:text-black"
            )}
          >
            {city.name}
          </Link>
        ))}
      </div>
      
      <div className={cn(
        "mt-4 text-xs font-mono opacity-60",
        "text-weather-text"
      )}>
        Showing 10 of {ALL_CITIES.length} cities • Click shuffle for more
      </div>
    </div>
  )
}
