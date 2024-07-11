import z from 'zod'

const ERROR_MSG = "Select if the Safer Custody team is already aware of this referral or not, or select 'I don't know"

export const schema = z.object({
  isSaferCustodyTeamInformed: z
    .string({ message: ERROR_MSG })
    .refine(val => ['yes', 'no', 'do_not_know'].includes(val), ERROR_MSG),
})

export type SchemaType = z.infer<typeof schema>
