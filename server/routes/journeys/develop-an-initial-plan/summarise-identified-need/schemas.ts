import z from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Enter a summary of the identified need'
const TOO_LONG_ERROR_MSG = 'Summary of the identified need must be 1,000 characters or less'

export const schema = createSchema({
  identifiedNeed: z
    .string({ message: ERROR_MSG })
    .max(1000, TOO_LONG_ERROR_MSG)
    .refine(val => val?.trim().length > 0, { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
