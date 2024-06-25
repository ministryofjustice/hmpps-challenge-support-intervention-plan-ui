import z from 'zod'

export const schema = z.object({
  areaOfWork: z
    .string({ message: 'You must select a valid value' })
    .min(1, 'You must select a valid value')
    .max(12, 'You must select a valid value'),
})
