import z from 'zod'

export const schema = z
  .object({
    isOnBehalfOfReferral: z.boolean({
      message: `Select if you're making this referral on someone else's behalf or not`,
    }),
  })
  .strict()
export type SchemaType = z.infer<typeof schema>
