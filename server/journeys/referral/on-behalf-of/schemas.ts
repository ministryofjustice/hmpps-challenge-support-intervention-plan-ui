import z from 'zod'

const csrfSchema = z.object({
  _csrf: z.string().optional(),
})

const isOnBehalfOfReferralErrorMsg = `Select if you're making this referral on someone else's behalf or not`
export const schema = csrfSchema
  .merge(
    z.object({
      isOnBehalfOfReferral: z
        .string({
          message: isOnBehalfOfReferralErrorMsg,
        })
        .transform<boolean>((val, ctx) => {
          if (!['false', 'true'].includes(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: isOnBehalfOfReferralErrorMsg,
            })
            return z.NEVER
          }
          return val === 'true'
        }),
    }),
  )
  .strict()
export type SchemaType = z.infer<typeof schema>
