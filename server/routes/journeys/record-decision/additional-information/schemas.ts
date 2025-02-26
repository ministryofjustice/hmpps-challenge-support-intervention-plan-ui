import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ERROR_MSG = 'Enter a description of the reasons for the decision'
const UPDATE_ERROR_MSG = 'Enter an update to the additional information'

export const schemaFactory = async (req: Request, res: Response, isChange?: boolean) => {
  const maxLengthChars =
    req.journeyData.isUpdate && !isChange
      ? getMaxCharsAndThresholdForAppend(
          res.locals.user.displayName,
          req.journeyData.csipRecord?.referral?.decisionAndActions?.actionOther,
        ).maxLengthChars
      : 4000

  const TOO_LONG_ERROR_MSG = `${req.journeyData.isUpdate && !isChange ? 'Update to the additional' : 'Additional'} information must be ${maxLengthChars.toLocaleString()} characters or less`

  return createSchema({
    actionOther: z
      .string({ message: req.journeyData.isUpdate && !isChange ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(maxLengthChars, TOO_LONG_ERROR_MSG)
      .refine(
        val => (val && val.trim().length > 0) || !req.journeyData.isUpdate || isChange,
        req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG,
      )
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
