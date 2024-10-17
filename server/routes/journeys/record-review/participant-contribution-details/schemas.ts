import z from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const NAME_TEXT_TOO_LONG_ERROR_MSG = 'Participant’s name must be 100 characters or less'
const ROLE_TEXT_TOO_LONG_ERROR_MSG = 'Participant’s role must be 50 characters or less'
const CONTRIBUTION_TEXT_TOO_LONG_ERROR_MSG = 'Contribution must be 4,000 characters or less'

const NAME_REQUIRED_MSG = 'Enter the participant’s name'
const ROLE_REQUIRED_MSG = 'Enter the participant’s role'
const IS_ATTENDED_REQUIRED_MSG = 'Select if the participant attended the review meeting in person or not'

export const schemaFactory = () => async () => {
  return createSchema({
    name: z
      .string({ message: NAME_REQUIRED_MSG })
      .max(100, NAME_TEXT_TOO_LONG_ERROR_MSG)
      .refine(val => val?.trim().length > 0, { message: NAME_REQUIRED_MSG }),

    role: z
      .string({ message: ROLE_REQUIRED_MSG })
      .max(50, ROLE_TEXT_TOO_LONG_ERROR_MSG)
      .refine(val => val?.trim().length > 0, { message: ROLE_REQUIRED_MSG }),

    isAttended: z
      .string({ message: IS_ATTENDED_REQUIRED_MSG })
      .trim()
      .refine(val => ['false', 'true'].includes(val), { message: IS_ATTENDED_REQUIRED_MSG })
      .transform(val => val === 'true'),

    contribution: z
      .string()
      .max(4000, CONTRIBUTION_TEXT_TOO_LONG_ERROR_MSG)
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
