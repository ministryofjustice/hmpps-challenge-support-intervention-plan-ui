import { z } from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const OUTCOME_REQUIRED_MSG = 'Select the outcome of the review.'
const opts = ['REMAIN_ON_CSIP', 'CLOSE_CSIP'] as const

export const schema = createSchema({
  outcome: z.enum(opts, { message: OUTCOME_REQUIRED_MSG }),
})

export type SchemaType = z.infer<typeof schema>
