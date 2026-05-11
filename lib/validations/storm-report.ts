import { z } from 'zod'

export const stormReportSubmitSchema = z.object({
  report_type: z.enum(['hail', 'wind', 'tornado', 'flood', 'funnel', 'other']),
  description: z.string().trim().min(10).max(2000),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  location_name: z.string().max(200).optional().nullable(),
  image_url: z.union([z.string().url().max(800), z.literal('')]).optional().nullable(),
  occurred_at: z.string().datetime().optional(),
})

export function formatStormReportValidationErrors(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
}
