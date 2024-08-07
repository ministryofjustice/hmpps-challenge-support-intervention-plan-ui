import z from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const REASONS_MSG = 'Enter a description of the prisoner’s usual behaviour presentation'
const TOO_LONG_ERROR_MSG = 'Description of the prisoner’s usual behaviour presentation must be 4,000 characters or less'

export const schema = createSchema({
  personsUsualBehaviour: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .refine(value => value?.trim().length > 0, { message: REASONS_MSG }),
})

export type SchemaType = z.infer<typeof schema>
