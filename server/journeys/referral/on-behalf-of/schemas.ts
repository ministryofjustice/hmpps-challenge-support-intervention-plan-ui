import z from 'zod'

export const schema = z
  .object({
    isOnBehalfOfReferral: z
      .string({ message: `Select if you're making this referral on someone else's behalf or not` })
      .transform<boolean>((val, ctx) => {
        if (!['false', 'true'].includes(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Select if you're making this referral on someone else's behalf or not`,
          })
          return z.NEVER
        }
        return val === 'true'
      }),
    _csrf: z.string(),
  })
  .strict()
export type SchemaType = z.infer<typeof schema>
