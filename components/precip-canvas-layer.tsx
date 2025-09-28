// @ts-nocheck
'use client'

import React from 'react'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type QuantizedPrecipLayerOptions = L.GridLayerOptions & {
  time?: number
  opacity?: number
}

/**
 * Leaflet GridLayer that fetches OpenWeather precipitation tiles and re-colors them
 * into crisp stepped buckets with a high-contrast palette. It does not require raw dBZ;
 * it quantizes the incoming intensity (estimated from luminance) to buckets and hides
 * near-zero noise.
 */
class QuantizedPrecipLayer extends L.GridLayer {
  declare options: QuantizedPrecipLayerOptions

  constructor(options: QuantizedPrecipLayerOptions) {
    super(options)
  }

  createTile(coords: L.Coords, done: (error?: Error | null, tile?: HTMLCanvasElement) => void): HTMLCanvasElement {
    const tileSize = (L as any).point ? (L as any).point(256, 256) : { x: 256, y: 256 }
    const canvas = L.DomUtil.create('canvas') as HTMLCanvasElement
    canvas.width = tileSize.x
    canvas.height = tileSize.y
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      done(new Error('Canvas 2D context not available'))
      return canvas
    }
    ;(ctx as any).imageSmoothingEnabled = false
    ;(canvas.style as any).imageRendering = 'pixelated'

    const { z } = coords
    const x = (coords.x % Math.pow(2, z) + Math.pow(2, z)) % Math.pow(2, z) // wrap world
    const y = coords.y
    const time = this.options.time

    const src = typeof time === 'number'
      ? `/api/weather/radar/precipitation_new/${time}/${z}/${x}/${y}`
      : `/api/weather/radar/precipitation_new/${z}/${x}/${y}`

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Quantize to buckets based on approximate intensity from luminance
        // Map luminance [0,255] -> pseudo-dBZ [0,70], clamp at 10
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          if (a === 0) continue
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
          // Heuristic: some OWM tiles encode low precip as very dark; boost slightly
          const pseudoDbz = Math.max(0, Math.min(70, (luminance / 255) * 70))

          if (pseudoDbz < 10) {
            data[i + 3] = 0 // hide drizzle/ground clutter
            continue
          }

          let color: [number, number, number]
          if (pseudoDbz < 20) color = hexToRgb('#b7e4ff')
          else if (pseudoDbz < 30) color = hexToRgb('#7fd2ff')
          else if (pseudoDbz < 40) color = hexToRgb('#4fb6ff')
          else if (pseudoDbz < 50) color = hexToRgb('#2f85ff')
          else if (pseudoDbz < 60) color = hexToRgb('#d24d4d')
          else color = hexToRgb('#8b0000')

          data[i] = color[0]
          data[i + 1] = color[1]
          data[i + 2] = color[2]
          data[i + 3] = 255 // full opacity for crisp steps; global layer opacity applied via pane
        }

        ctx.putImageData(imageData, 0, 0)
        if (this.options.opacity !== undefined) canvas.style.opacity = String(this.options.opacity)
        done(null, canvas)
      } catch (e) {
        done(e as Error, canvas)
      }
    }
    img.onerror = () => done(new Error('Failed to load precip tile'), canvas)
    img.src = src
    return canvas
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

interface PrecipCanvasLayerProps {
  time?: number
  opacity?: number
  pane?: string
  zIndex?: number
}

export default function PrecipCanvasLayer({ time, opacity = 0.8, pane = 'precip', zIndex = 500 }: PrecipCanvasLayerProps) {
  const map = useMap()
  const layerRef = useRef<QuantizedPrecipLayer | null>(null)

  useEffect(() => {
    const paneEl = map.createPane(pane)
    if (paneEl) paneEl.style.zIndex = String(zIndex)
    const layer = new QuantizedPrecipLayer({ pane, tileSize: 256, updateWhenIdle: true, time, opacity })
    layerRef.current = layer
    map.addLayer(layer as unknown as L.Layer)
    return () => {
      if (layerRef.current) {
        layerRef.current.removeFrom(map)
        layerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.options.time = time
    layerRef.current.redraw()
  }, [time])

  useEffect(() => {
    if (!layerRef.current) return
    // Opacity per canvas tile via CSS handled in createTile
    layerRef.current.options.opacity = opacity
    layerRef.current.redraw()
  }, [opacity])

  return null
}

