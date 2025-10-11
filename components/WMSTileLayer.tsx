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

    // Create WMS layer
    const wmsLayer = L.tileLayer.wms(url, {
      layers,
      format,
      transparent,
      opacity,
      attribution,
      // @ts-ignore - time parameter may not be in types but is valid for WMS
      time: time || undefined,
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
    })

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
      // Force redraw with new time parameter
      // @ts-ignore - time parameter may not be in types but is valid for time-enabled WMS
      layerRef.current.setParams({ time: time }, false)
      layerRef.current.redraw()
    }
  }, [time])

  return null // This component doesn't render anything directly
}
