import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ERROR_MSG = 'Enter a description of the reasons for the decision'
const UPDATE_ERROR_MSG = 'Enter an update to the additional information'
const TOO_LONG_ERROR_MSG = (isUpdate: boolean, maxLengthChars: number) =>
  `${isUpdate ? 'Update to the additional' : 'Additional'} information must be ${maxLengthChars.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.decisionAndActions?.actionOther,
      ).maxLengthChars
    : 4000

  return createSchema({
    actionOther: z
      .string({ message: req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(maxLengthChars, TOO_LONG_ERROR_MSG(Boolean(req.journeyData.isUpdate), maxLengthChars))
      .refine(
        val => (val && val.trim().length > 0) || !req.journeyData.isUpdate,
        req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG,
      )
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
