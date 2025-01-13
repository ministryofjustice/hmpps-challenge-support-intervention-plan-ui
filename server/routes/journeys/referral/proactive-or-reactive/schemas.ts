import { z } from 'zod'
import { createSchema, validateAndTransformReferenceData } from '../../../../middleware/validationMiddleware'

const ERROR_MESSAGE = 'Select if this referral is proactive or reactive'

const IS_PROACTIVE_REFERRAL_MAP = new Map([
  ['proactive', true],
  ['reactive', false],
])

export const schema = createSchema({
  isProactiveReferral: z
    .string({ message: ERROR_MESSAGE })
    .transform(validateAndTransformReferenceData(IS_PROACTIVE_REFERRAL_MAP, ERROR_MESSAGE)),
})

export type SchemaType = z.infer<typeof schema>
