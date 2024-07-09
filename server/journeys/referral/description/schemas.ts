import z from 'zod'
import { Request } from 'express'
import { SchemaFactory } from '../../../middleware/validationMiddleware'

export const schemaFactory: SchemaFactory = async (req: Request): Promise<z.ZodTypeAny> => {
  const DESCRIPTION_OF_CONCERN_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter a description of the behaviour and concerns'
    : 'Enter a description of the incident and concerns'

  const DESCRIPTION_OF_CONCERN_TOO_LONG_MSG = 'Description must be 4,000 characters or less'

  return z.object({
    descriptionOfConcern: z
      .string({ message: DESCRIPTION_OF_CONCERN_MSG })
      .max(4000, DESCRIPTION_OF_CONCERN_TOO_LONG_MSG)
      .refine(val => val && val.trim().length > 0, DESCRIPTION_OF_CONCERN_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
