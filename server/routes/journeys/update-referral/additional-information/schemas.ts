import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ADDITIONAL_INFORMATION_MSG = 'Enter an update to the additional information'
const TOO_LONG_MSG = (length: number) => `Additional information must be ${length.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral.otherInformation,
      ).maxLengthChars
    : 4000

  return createSchema({
    otherInformation: z
      .string()
      .max(maxLengthChars, TOO_LONG_MSG(maxLengthChars))
      .refine(val => val && val.trim().length > 0, ADDITIONAL_INFORMATION_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
