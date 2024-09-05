import z from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'

const REASONS_TOO_LONG_MSG = 'Reasons must be 4,000 characters or less'

export const schemaFactory = async (req: Request) => {
  const REASONS_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter the reasons given for the behaviour'
    : 'Enter the reasons given for the incident'

  return createSchema({
    knownReasons: z
      .string({ message: REASONS_MSG })
      .max(4000, REASONS_TOO_LONG_MSG)
      .refine(val => val && val.trim().length > 0, REASONS_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
