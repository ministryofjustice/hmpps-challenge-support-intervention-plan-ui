import z from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const ERROR_MSG = "Select if the Safer Custody team is already aware of this referral or not, or select 'I don't know"

export const YES_NO_ANSWER = z.enum(['YES', 'NO', 'DO_NOT_KNOW'] as const, {
  message: ERROR_MSG,
})

export const schema = createSchema({
  isSaferCustodyTeamInformed: YES_NO_ANSWER,
})

export type SchemaType = z.infer<typeof schema>
