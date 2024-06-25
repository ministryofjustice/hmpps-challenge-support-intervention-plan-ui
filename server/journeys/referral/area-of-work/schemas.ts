import z from 'zod'

export const schema = z.object({
  areaOfWork: z
    .string({ message: 'Select your area of work' })
    .min(1, 'Select your area of work')
    .max(12, 'Select your area of work'),
})
