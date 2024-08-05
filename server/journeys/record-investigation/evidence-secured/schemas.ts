import z from 'zod'

const REASONS_MSG = 'Enter a description of the evidence secured'
const TOO_LONG_ERROR_MSG = 'Description of the evidence secured must be 4,000 characters or less'

export const schema = z.object({
  evidenceSecured: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .trim()
    .min(1, { message: REASONS_MSG }),
})

export type SchemaType = z.infer<typeof schema>
