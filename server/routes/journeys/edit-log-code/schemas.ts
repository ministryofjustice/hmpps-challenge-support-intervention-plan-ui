import { z } from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const ERROR_MSG = 'Enter a CSIP log code'
const TOO_LONG_ERROR_MSG = 'CSIP log code must be 10 characters or less'

export const schema = createSchema({
  logCode: z
    .string({ message: ERROR_MSG })
    .max(10, TOO_LONG_ERROR_MSG)
    .refine(val => val && val.trim().length > 0, ERROR_MSG),
})

export type SchemaType = z.infer<typeof schema>
