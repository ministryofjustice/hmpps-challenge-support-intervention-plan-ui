import z from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const REASONS_MSG = 'Enter a description of why the behaviour occurred'
const TOO_LONG_ERROR_MSG = 'Description of why the behaviour occurred must be 4,000 characters or less'

export const schema = createSchema({
  occurrenceReason: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .refine(val => val && val.trim().length > 0, REASONS_MSG),
})

export type SchemaType = z.infer<typeof schema>
