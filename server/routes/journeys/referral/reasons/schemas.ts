import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const REASONS_TOO_LONG_MSG = (length: number) => `Reasons must be ${length.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(res.locals.user.displayName, req.journeyData.csipRecord?.referral.knownReasons)
        .maxLengthChars
    : 4000

  const REASONS_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter the reasons given for the behaviour'
    : 'Enter the reasons given for the incident'

  return createSchema({
    knownReasons: z
      .string({ message: REASONS_MSG })
      .max(maxLengthChars, REASONS_TOO_LONG_MSG(maxLengthChars))
      .refine(val => val && val.trim().length > 0, REASONS_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
