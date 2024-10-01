import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ERROR_MSG = 'Enter the names of staff involved in the investigation'
const UPDATE_ERROR_MSG = 'Enter an update on the staff involved in the investigation'
const TOO_LONG_ERROR_MSG = (isUpdate: boolean | undefined, maxLengthChars: number) =>
  `${isUpdate ? 'Update to the staff involved' : 'Names of staff involved in the investigation'} must be ${maxLengthChars.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.investigation?.staffInvolved,
      ).maxLengthChars
    : 4000

  return createSchema({
    staffInvolved: z
      .string({ message: req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(maxLengthChars, TOO_LONG_ERROR_MSG(req.journeyData.isUpdate, maxLengthChars))
      .refine(val => val && val.trim().length > 0, req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
