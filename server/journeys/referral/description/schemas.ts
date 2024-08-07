import z from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../middleware/validationMiddleware'

const DESCRIPTION_OF_CONCERN_TOO_LONG_MSG = 'Description must be 4,000 characters or less'

export const schemaFactory = async (req: Request) => {
  const DESCRIPTION_OF_CONCERN_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter a description of the behaviour and concerns'
    : 'Enter a description of the incident and concerns'

  return createSchema({
    descriptionOfConcern: z
      .string({ message: DESCRIPTION_OF_CONCERN_MSG })
      .max(4000, DESCRIPTION_OF_CONCERN_TOO_LONG_MSG)
      .refine(val => val && val.trim().length > 0, DESCRIPTION_OF_CONCERN_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
