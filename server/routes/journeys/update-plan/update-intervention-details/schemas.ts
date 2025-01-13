import { z } from 'zod'
import { createSchema, validateTransformDate } from '../../../../middleware/validationMiddleware'

const TARGET_DATE_REQUIRED_MSG = 'Enter the target date'
const TARGET_DATE_INVALID_ERROR_MSG = 'Target date must be a real date'

const RESPONSIBLE_PERSON_REQUIRED_MSG = 'Enter the name of the person responsible for taking action'
const RESPONSIBLE_PERSON_TOO_LONG_ERROR_MSG =
  'Name of the person responsible for taking action must be 100 characters or less'

export const schema = createSchema({
  responsiblePerson: z
    .string({ message: RESPONSIBLE_PERSON_REQUIRED_MSG })
    .max(100, RESPONSIBLE_PERSON_TOO_LONG_ERROR_MSG)
    .refine(val => val?.trim().length > 0, { message: RESPONSIBLE_PERSON_REQUIRED_MSG }),

  targetDate: validateTransformDate(TARGET_DATE_REQUIRED_MSG, TARGET_DATE_INVALID_ERROR_MSG),
})

export type SchemaType = z.infer<typeof schema>
