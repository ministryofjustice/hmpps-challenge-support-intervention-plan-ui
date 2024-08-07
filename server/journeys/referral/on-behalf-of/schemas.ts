import z from 'zod'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

const IS_ON_BEHALF_OF_REFERRAL_ERROR_MSG = `Select if you're making this referral on someone else's behalf or not`

const IS_ON_BEHALF_OF_REFERRAL_MAP = new Map([
  ['true', true],
  ['false', false],
])

export const schema = createSchema({
  isOnBehalfOfReferral: z
    .string({ message: IS_ON_BEHALF_OF_REFERRAL_ERROR_MSG })
    .transform(validateAndTransformReferenceData(IS_ON_BEHALF_OF_REFERRAL_MAP, IS_ON_BEHALF_OF_REFERRAL_ERROR_MSG)),
})

export type SchemaType = z.infer<typeof schema>
