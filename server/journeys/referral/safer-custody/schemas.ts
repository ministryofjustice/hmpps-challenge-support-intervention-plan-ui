import z from 'zod'

const ERROR_MSG = "Select if the Safer Custody team is already aware of this referral or not, or select 'I don't know"

export const schema = z.object({
  isSaferCustodyTeamInformed: z.enum(['YES', 'NO', 'DO_NOT_KNOW'] as const, {
    message: ERROR_MSG,
  }),
})

export type SchemaType = z.infer<typeof schema>
