import z from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const REASON_FOR_PLAN_REQUIRED_MSG = 'Enter the main reason why the prisoner needs a plan'
const REASON_FOR_PLAN_TOO_LONG_ERROR_MSG = 'Reason why the prisoner needs a plan must be 500 characters or less'

const CASE_MANAGER_REQUIRED_MSG = 'Enter the Case Manager’s name'
const CASE_MANAGER_TOO_LONG_ERROR_MSG = 'Case Manager’s name must be 100 characters or less'

export const schema = createSchema({
  caseManager: z
    .string({ message: CASE_MANAGER_REQUIRED_MSG })
    .max(100, CASE_MANAGER_TOO_LONG_ERROR_MSG)
    .refine(val => val?.trim().length > 0, { message: CASE_MANAGER_REQUIRED_MSG }),

  reasonForPlan: z
    .string({ message: REASON_FOR_PLAN_REQUIRED_MSG })
    .max(500, REASON_FOR_PLAN_TOO_LONG_ERROR_MSG)
    .refine(val => val?.trim().length > 0, { message: REASON_FOR_PLAN_REQUIRED_MSG }),
})

export type SchemaType = z.infer<typeof schema>
