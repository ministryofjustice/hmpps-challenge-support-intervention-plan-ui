import z from 'zod'

export const schema = z.object({
  foo: z
    .string({ message: 'You must enter a value between 1-40 characters' })
    .min(1, 'You must enter a value between 1-40 characters'),
})
