import { z } from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const TOO_LONG_ERROR_MSG = 'Comment must be 4,000 characters or less'

export const schema = createSchema({
  comment: z
    .string()
    .max(4000, TOO_LONG_ERROR_MSG)
    .transform(val => (val?.trim().length ? val : null)),
})

export type SchemaType = z.infer<typeof schema>
