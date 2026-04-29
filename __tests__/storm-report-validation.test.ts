import { stormReportSubmitSchema } from '@/lib/validations/storm-report'

describe('stormReportSubmitSchema', () => {
  it('accepts a valid payload', () => {
    const r = stormReportSubmitSchema.safeParse({
      report_type: 'hail',
      description: 'Ten chars min',
      latitude: 35.5,
      longitude: -97.5,
      location_name: 'OKC',
      image_url: '',
    })
    expect(r.success).toBe(true)
  })

  it('rejects short description', () => {
    const r = stormReportSubmitSchema.safeParse({
      report_type: 'wind',
      description: 'short',
      latitude: 0,
      longitude: 0,
    })
    expect(r.success).toBe(false)
  })
})
