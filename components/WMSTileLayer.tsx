'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface WMSTileLayerProps {
  url: string
  layers: string
  format?: string
  transparent?: boolean
  opacity?: number
  time?: number | string
  attribution?: string
  zIndex?: number
}

/**
 * Custom WMS TileLayer component for react-leaflet
 * Supports time-enabled WMS services like NOAA MRMS
 */
export function WMSTileLayer({
  url,
  layers,
  format = 'image/png',
  transparent = true,
  opacity = 0.7,
  time,
  attribution = '',
  zIndex = 400
}: WMSTileLayerProps) {
  const map = useMap()
  const layerRef = useRef<L.TileLayer.WMS | null>(null)

  // ADD THIS DEBUGGING
  console.log('🔧 WMSTileLayer render:', {
    url,
    layers,
    format,
    transparent,
    opacity,
    time,
    zIndex,
    hasMap: !!map
  })

  useEffect(() => {
    if (!map) {
      console.error('❌ WMSTileLayer: No map instance!')
      return
    }

    console.log('🎬 Creating WMS layer with params:', {
      url,
      layers,
      time,
      opacity,
      zIndex
    })

    // Create WMS layer with proper TIME parameter handling
    const wmsOptions: any = {
      layers,
      format,
      transparent,
      opacity,
      attribution,
      version: '1.3.0',
      crs: L.CRS.EPSG3857,
      // Performance optimizations
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      maxNativeZoom: 10,
      maxZoom: 18,
      tileSize: 256,
      zIndex
    }

    // Add TIME parameter to uppercase option name for WMS compatibility
    if (time) {
      wmsOptions.TIME = typeof time === 'string' ? time : new Date(time).toISOString()
      console.log('  📅 TIME parameter set to:', wmsOptions.TIME)
    }

    const wmsLayer = L.tileLayer.wms(url, wmsOptions)

    // ADD EVENT LISTENERS FOR DEBUGGING
    wmsLayer.on('loading', () => {
      console.log('⏳ WMS tiles loading...')
    })

    wmsLayer.on('load', () => {
      console.log('✅ WMS tiles loaded successfully')
    })

    wmsLayer.on('tileerror', (error: any) => {
      console.error('❌ WMS tile error:', error)
    })

    wmsLayer.on('tileloadstart', (e: any) => {
      console.log('🔄 Tile load start:', e.url || 'no url')
    })

    wmsLayer.on('tileload', (e: any) => {
      console.log('✅ Tile loaded:', e.url || 'no url')
    })

    console.log('➕ Adding WMS layer to map')
    wmsLayer.addTo(map)
    layerRef.current = wmsLayer

    // Log the actual URL being requested
    try {
      const exampleUrl = (wmsLayer as any).getTileUrl({ x: 0, y: 0, z: 5 })
      console.log('📍 WMS GetMap URL example:', exampleUrl)
    } catch (e) {
      console.warn('Could not generate example URL:', e)
    }

    return () => {
      console.log('🗑️ Removing WMS layer from map')
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, url])

  // Update opacity when it changes
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity)
    }
  }, [opacity])

  // Update time parameter when it changes
  useEffect(() => {
    if (layerRef.current && time !== undefined) {
      // Force redraw with new time parameter (uppercase TIME for WMS standard)
      const timeValue = typeof time === 'string' ? time : new Date(time).toISOString()
      console.log('⏰ Updating TIME parameter to:', timeValue)
      // @ts-ignore - TIME parameter may not be in types but is valid for time-enabled WMS
      layerRef.current.setParams({ TIME: timeValue }, false)
      layerRef.current.redraw()
    }
  }, [time])

  return null // This component doesn't render anything directly
}
