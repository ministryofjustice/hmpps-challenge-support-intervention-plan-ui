import z from 'zod'

const TOO_LONG_ERROR_MSG = 'Description must be 4,000 characters or less'

export const schema = z.object({
  comment: z
    .string()
    .max(4000, TOO_LONG_ERROR_MSG)
    .transform(val => (val?.trim().length ? val : null)),
})

export type SchemaType = z.infer<typeof schema>
