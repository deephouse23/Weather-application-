/**
 * Unit tests for OpenMeteoAttribution component
 *
 * Verifies CC BY 4.0 attribution requirements for Open-Meteo data.
 */

import { render, screen } from '@testing-library/react'
import { OpenMeteoAttribution } from '@/components/open-meteo-attribution'

describe('OpenMeteoAttribution', () => {
  it('should render attribution text with link to open-meteo.com', () => {
    render(<OpenMeteoAttribution />)

    const link = screen.getByRole('link', { name: /weather data by open-meteo\.com/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://open-meteo.com/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should accept an optional className prop', () => {
    render(<OpenMeteoAttribution className="mt-4" />)

    const link = screen.getByRole('link', { name: /weather data by open-meteo\.com/i })
    expect(link).toHaveClass('mt-4')
  })

  it('should include CC BY 4.0 reference in title attribute', () => {
    render(<OpenMeteoAttribution />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('title', expect.stringContaining('CC BY 4.0'))
  })

  it('should render with badge-like styling matching WIS badge pattern', () => {
    render(<OpenMeteoAttribution />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('rounded-full', 'border', 'text-xs', 'font-mono')
  })

  it('should render Open-Meteo.com in bold for emphasis', () => {
    render(<OpenMeteoAttribution />)

    const boldText = screen.getByText('Open-Meteo.com')
    expect(boldText.tagName).toBe('SPAN')
    expect(boldText).toHaveClass('font-bold')
  })
})
