import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export const schemaFactory = async (req: Request, res: Response) => {
  const ERROR_MSG = 'Enter a description of the evidence secured'
  const UPDATE_ERROR_MSG = 'Enter an update to the description of the evidence secured'

  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.investigation?.evidenceSecured,
      ).maxLengthChars
    : 4000

  return createSchema({
    evidenceSecured: z
      .string({ message: req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(
        maxLengthChars,
        `Description of the evidence secured must be ${maxLengthChars.toLocaleString()} characters or less`,
      )
      .refine(val => val && val.trim().length > 0, req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
