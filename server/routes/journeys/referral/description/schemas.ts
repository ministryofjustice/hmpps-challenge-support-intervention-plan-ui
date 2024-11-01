import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral.descriptionOfConcern,
      ).maxLengthChars
    : 4000

  const MAX_MSG = req.journeyData.isUpdate
    ? `Update to the description must be ${maxLengthChars.toLocaleString()} or less`
    : `Description must be 4,000 characters or less`

  const keyword = req.journeyData.referral!.isProactiveReferral ? 'behaviour' : 'incident'
  const REQUIRED_MSG = req.journeyData.isUpdate
    ? `Enter an update to the description of the ${keyword} and concerns`
    : `Enter a description of the ${keyword} and concerns`

  return createSchema({
    descriptionOfConcern: z
      .string({ message: REQUIRED_MSG })
      .max(maxLengthChars, MAX_MSG)
      .refine(val => val && val.trim().length > 0, REQUIRED_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
