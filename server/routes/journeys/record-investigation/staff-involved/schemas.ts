import z from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const REASONS_MSG = 'Enter the names of staff involved in the investigation'
const TOO_LONG_ERROR_MSG = 'Names of staff involved in the investigation must be 4,000 characters or less'

export const schema = createSchema({
  staffInvolved: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .refine(val => val && val.trim().length > 0, REASONS_MSG),
})

export type SchemaType = z.infer<typeof schema>
