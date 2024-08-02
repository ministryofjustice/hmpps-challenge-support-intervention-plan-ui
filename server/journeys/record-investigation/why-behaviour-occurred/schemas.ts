import z from 'zod'

const REASONS_MSG = 'Enter a description of why the behaviour occurred'
const TOO_LONG_ERROR_MSG = 'Description of why the behaviour occurred must be 4,000 characters or less'

export const schema = z.object({
  occurrenceReason: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .refine(val => val && val.trim().length > 0, REASONS_MSG),
})

export type SchemaType = z.infer<typeof schema>
