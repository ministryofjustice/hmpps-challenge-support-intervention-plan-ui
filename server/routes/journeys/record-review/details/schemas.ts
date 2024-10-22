import z from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Enter details of the review'
const TOO_LONG_ERROR_MSG = 'Details of the review must be 4,000 characters or less'

export const schema = createSchema({
  summary: z
    .string({ message: ERROR_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .refine(val => val && val.trim().length > 0, ERROR_MSG),
})

export type SchemaType = z.infer<typeof schema>
