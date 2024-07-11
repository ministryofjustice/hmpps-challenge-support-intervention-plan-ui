import z from 'zod'
import { Request } from 'express'
import { SchemaFactory } from '../../../middleware/validationMiddleware'

export const schemaFactory: SchemaFactory = async (req: Request): Promise<z.ZodTypeAny> => {
  const REASONS_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter the reasons given for the behaviour'
    : 'Enter the reasons given for the incident'

  const REASONS_TOO_LONG_MSG = 'Description must be 4,000 characters or less'

  return z.object({
    knownReasons: z
      .string({ message: REASONS_MSG })
      .max(4000, REASONS_TOO_LONG_MSG)
      .refine(val => val && val.trim().length > 0, REASONS_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
