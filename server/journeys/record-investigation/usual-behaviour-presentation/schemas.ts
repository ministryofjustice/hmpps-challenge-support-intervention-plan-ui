import z from 'zod'

const REASONS_MSG = "Enter a description of the prisoner's usual behaviour presentation"
const TOO_LONG_ERROR_MSG = "Description of the prisoner's usual behaviour presentation must be 4,000 characters or less"

export const schema = z.object({
  personsUsualBehaviour: z
    .string({ message: REASONS_MSG })
    .max(4000, TOO_LONG_ERROR_MSG)
    .trim()
    .min(1, { message: REASONS_MSG }),
})

export type SchemaType = z.infer<typeof schema>
