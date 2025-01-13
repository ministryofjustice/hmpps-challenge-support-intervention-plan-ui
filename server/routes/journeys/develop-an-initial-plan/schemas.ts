import { z } from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const IS_CASE_MANAGER_ERROR_MSG = 'Select if you’re the Case Manager for this plan or not'
const CASE_MANAGER_ERROR_MSG = 'Enter the Case Manager’s name'
const TOO_LONG_CASE_MANAGER_ERROR_MSG = 'Case Manager’s name must be 100 characters or less'
const REASON_ERROR_MSG = 'Enter the main reason why the prisoner needs a plan'
const TOO_LONG_REASON_ERROR_MSG = 'Reason why the prisoner needs a plan must be 240 characters or less'

export const schema = createSchema({
  isCaseManager: z
    .string({ message: IS_CASE_MANAGER_ERROR_MSG })
    .trim()
    .refine(val => ['false', 'true'].includes(val), { message: IS_CASE_MANAGER_ERROR_MSG }),
  caseManager: z.string().max(100, { message: TOO_LONG_CASE_MANAGER_ERROR_MSG }),
  reasonForPlan: z
    .string()
    .max(240, { message: TOO_LONG_REASON_ERROR_MSG })
    .refine(val => val?.trim().length > 0, { message: REASON_ERROR_MSG }),
})
  .refine(val => val.isCaseManager !== 'false' || val.caseManager?.trim().length > 0, {
    message: CASE_MANAGER_ERROR_MSG,
    path: ['caseManager'],
  })
  .transform(val => ({
    ...val,
    isCaseManager: val.isCaseManager === 'true',
    caseManager: val.isCaseManager === 'false' ? val.caseManager : null,
  }))

export type SchemaType = z.infer<typeof schema>
