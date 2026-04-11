/**
 * 16-Bit Weather Platform - v1.0.0
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 */

/**
 * City Weather Page - Server Component
 *
 * Ships a full, server-rendered SEO article for every city so Googlebot sees
 * meaningful unique content in the raw HTML (not after JS hydration). Rich
 * content for flagship cities comes from `cityEnrichments`; other cities fall
 * back to the short intro/climate/patterns copy with a consistent structure.
 *
 * Below the article, the interactive <CityWeatherClient> renders the live
 * weather widget and handles user interactions.
 */

import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

import CityWeatherClient from './client'
import {
  cityData as cityMetadata,
  getCityEnrichment,
  getNearbyCities,
} from '@/lib/city-metadata'

const BASE_URL = 'https://www.16bitweather.co'
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Generate static pages for better SEO
export async function generateStaticParams(): Promise<Array<{ city: string }>> {
  return Object.keys(cityMetadata).map(citySlug => ({ city: citySlug }))
}

// Generate metadata for each city page
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = cityMetadata[citySlug]

  // For non-predefined slugs, the page still renders a working client-side
  // weather search. Emit minimal metadata with noindex so Google doesn't
  // crawl and index every ad-hoc slug users happen to visit.
  if (!city) {
    const displayName = formatCityName(citySlug)
    return {
      title: `${displayName} Weather Forecast | 16 Bit Weather`,
      description: `Live weather conditions and forecast for ${displayName}.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${BASE_URL}/weather/${citySlug}` },
    }
  }

  const pageTitle = `${city.name}, ${city.state} Weather Forecast & Climate Guide | 16 Bit Weather`
  const description = `${city.name}, ${city.state} weather forecast, climate guide, monthly averages, and best time to visit. Real-time conditions, 7-day outlook, and deep local climate data in retro terminal style.`

  return {
    title: pageTitle,
    description,
    keywords: `${city.name} weather, ${city.name} ${city.state} weather, ${city.name} climate, ${city.name} forecast, ${city.name} temperature, best time to visit ${city.name}, ${city.name} monthly weather, 16 bit weather`,
    openGraph: {
      title: pageTitle,
      description,
      url: `${BASE_URL}/weather/${citySlug}`,
      siteName: '16 Bit Weather',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(city.name + ', ' + city.state)}&subtitle=Weather+Forecast`,
          width: 1200,
          height: 630,
          alt: `${city.name} Weather - 16 Bit Weather Terminal`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [`/api/og?title=${encodeURIComponent(city.name + ', ' + city.state)}&subtitle=Weather+Forecast`],
    },
    alternates: {
      canonical: `${BASE_URL}/weather/${citySlug}`,
    },
  }
}

interface PageParams {
  params: Promise<{ city: string }>
}

export default async function CityWeatherPage({ params }: PageParams) {
  const { city: citySlug } = await params
  const city = cityMetadata[citySlug]

  // If city doesn't exist in our predefined list, still render the client
  // component so dynamic searches work — but without rich SEO content, since
  // those pages are intentionally excluded from the sitemap.
  const cityInfo = city || {
    name: formatCityName(citySlug),
    state: '',
    searchTerm: citySlugToSearchTerm(citySlug),
    title: `${formatCityName(citySlug)} Weather Forecast - 16 Bit Weather`,
    description: `Current weather conditions and 7-day forecast for ${formatCityName(citySlug)}.`,
    content: {
      intro: `Weather information for ${formatCityName(citySlug)}.`,
      climate: 'Real-time weather data and forecasts available.',
      patterns: 'Check current conditions and extended forecasts.',
    },
  }

  const isPredefinedCity = !!city
  const enrichment = isPredefinedCity ? getCityEnrichment(citySlug) : null
  const nearbyCities = isPredefinedCity ? getNearbyCities(citySlug) : []
  const fullLocation = cityInfo.state ? `${cityInfo.name}, ${cityInfo.state}` : cityInfo.name

  // Structured data: WebPage + Place + BreadcrumbList
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${fullLocation} Weather Forecast & Climate Guide`,
    description: `${fullLocation} weather forecast, climate data, monthly averages, and best time to visit.`,
    url: `${BASE_URL}/weather/${citySlug}`,
    about: {
      '@type': 'Place',
      name: fullLocation,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cityInfo.name,
        addressRegion: cityInfo.state || undefined,
        addressCountry: 'US',
      },
    },
    mainEntity: {
      '@type': 'WeatherForecast',
      location: { '@type': 'Place', name: fullLocation },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: fullLocation, item: `${BASE_URL}/weather/${citySlug}` },
      ],
    },
  }

  // Structured data: FAQPage (only when we have curated FAQs)
  const faqJsonLd = enrichment?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: enrichment.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/*
        Server-rendered SEO content for predefined cities. This is in the
        initial HTML response (no JS required) so Googlebot sees real unique
        content for every city it crawls.
      */}
      {isPredefinedCity && (
        <article className="mx-auto max-w-4xl px-4 pt-8 pb-4 text-weather-text font-mono">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-wider text-weather-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-weather-primary">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-weather-primary" aria-current="page">
                {fullLocation}
              </li>
            </ol>
          </nav>

          {/* Hero / H1 — the single authoritative heading for the page */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-weather-primary mb-3">
              {`${fullLocation} Weather Forecast & Climate Guide`}
            </h1>
            <p className="text-sm md:text-base text-weather-muted leading-relaxed max-w-3xl">
              {cityInfo.content.intro}
            </p>
            {enrichment?.climateType && (
              <p className="mt-3 text-xs uppercase tracking-widest text-weather-muted">
                Climate type: <span className="text-weather-primary">{enrichment.climateType}</span>
              </p>
            )}
          </header>

          {/* Climate overview — always available, uses existing thin content as fallback */}
          <section className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-3">
              {cityInfo.name} Climate Overview
            </h2>
            <p className="text-sm leading-relaxed mb-3">{cityInfo.content.climate}</p>
            <p className="text-sm leading-relaxed">{cityInfo.content.patterns}</p>
          </section>

          {/* Seasonal breakdown — only for enriched cities */}
          {enrichment?.seasons && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-4">
                {cityInfo.name} Weather by Season
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['spring', 'summer', 'fall', 'winter'] as const).map(season => (
                  <div
                    key={season}
                    className="rounded-lg border-2 border-weather-border bg-weather-bg-elev p-4"
                  >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-weather-primary mb-2">
                      {season}
                    </h3>
                    <p className="text-xs leading-relaxed">{enrichment.seasons[season]}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Monthly averages table — high-value structured data.
              Guard on exact length === MONTH_LABELS.length so an off-by-one
              in future data can never silently misalign columns. */}
          {enrichment?.monthlyHighs?.length === MONTH_LABELS.length &&
            enrichment?.monthlyLows?.length === MONTH_LABELS.length && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-4">
                {cityInfo.name} Average Monthly Temperatures
              </h2>
              <div className="overflow-x-auto rounded-lg border-2 border-weather-border">
                <table className="w-full text-xs">
                  <caption className="sr-only">
                    Average monthly high and low temperatures for {fullLocation} in °F
                  </caption>
                  <thead className="bg-weather-bg-elev">
                    <tr>
                      <th scope="col" className="px-2 py-2 text-left uppercase tracking-wider">Month</th>
                      {MONTH_LABELS.map(month => (
                        <th key={month} scope="col" className="px-2 py-2 text-center uppercase tracking-wider">
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t-2 border-weather-border">
                      <th scope="row" className="px-2 py-2 text-left font-bold uppercase text-weather-primary">
                        High °F
                      </th>
                      {enrichment.monthlyHighs.map((temp, i) => (
                        <td key={i} className="px-2 py-2 text-center">{temp}°</td>
                      ))}
                    </tr>
                    <tr className="border-t border-weather-border">
                      <th scope="row" className="px-2 py-2 text-left font-bold uppercase text-weather-muted">
                        Low °F
                      </th>
                      {enrichment.monthlyLows.map((temp, i) => (
                        <td key={i} className="px-2 py-2 text-center">{temp}°</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Best time to visit + severe weather risks */}
          {enrichment?.bestTimeToVisit && (
            <section className="mb-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border-2 border-weather-border bg-weather-bg-elev p-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-weather-primary mb-2">
                  Best Time to Visit {cityInfo.name}
                </h2>
                <p className="text-xs leading-relaxed">{enrichment.bestTimeToVisit}</p>
              </div>
              {enrichment.severeRisks?.length > 0 && (
                <div className="rounded-lg border-2 border-weather-border bg-weather-bg-elev p-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-weather-primary mb-2">
                    Severe Weather Risks
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {enrichment.severeRisks.map(risk => (
                      <li
                        key={risk}
                        className="text-[10px] uppercase tracking-wider border border-weather-border rounded px-2 py-1"
                      >
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Unique local facts */}
          {enrichment?.uniqueFacts && enrichment.uniqueFacts.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-3">
                Weather Facts About {cityInfo.name}
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                {enrichment.uniqueFacts.map((fact, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-weather-primary">&gt;</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ section — also powers FAQPage JSON-LD above */}
          {enrichment?.faqs && enrichment.faqs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-4">
                {cityInfo.name} Weather FAQ
              </h2>
              <div className="space-y-4">
                {enrichment.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-lg border-2 border-weather-border bg-weather-bg-elev p-4"
                  >
                    <h3 className="text-sm font-bold text-weather-primary mb-2">{faq.question}</h3>
                    <p className="text-xs leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby cities — internal linking for crawl graph */}
          {nearbyCities.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wider text-weather-primary mb-4">
                Explore Nearby City Weather
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {nearbyCities.map(neighbor => (
                  <Link
                    key={neighbor.slug}
                    href={`/weather/${neighbor.slug}`}
                    className="block rounded-lg border-2 border-weather-border bg-weather-bg-elev p-3 text-xs uppercase tracking-wider transition-colors hover:border-weather-primary hover:text-weather-primary"
                  >
                    {neighbor.name}, {neighbor.state}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      )}

      {/* Interactive weather widget — client component */}
      <Suspense
        fallback={
          <div className="min-h-[400px] bg-gradient-to-b from-gray-900 to-black">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-white">Loading live weather data...</div>
            </div>
          </div>
        }
      >
        <CityWeatherClient city={cityInfo} citySlug={citySlug} isPredefinedCity={isPredefinedCity} />
      </Suspense>
    </>
  )
}

// Utility functions
function formatCityName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function citySlugToSearchTerm(slug: string): string {
  const parts = slug.split('-')
  if (parts.length > 1) {
    const state = parts[parts.length - 1].toUpperCase()
    const cityParts = parts.slice(0, -1)
    const cityName = cityParts.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    return `${cityName}, ${state}`
  }
  return formatCityName(slug)
}

// ISR: revalidate every 10 minutes so weather data stays fresh but SEO
// content is served from the cache for fast TTFB.
export const revalidate = 600
