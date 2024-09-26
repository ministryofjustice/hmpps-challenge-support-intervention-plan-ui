import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ERROR_MSG = 'Enter a description of the prisoner’s usual behaviour presentation'
const UPDATE_ERROR_MSG = 'Enter an update to the description of the prisoner’s usual behaviour presentation'

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.investigation?.personsUsualBehaviour,
      ).maxLengthChars
    : 4000

  return createSchema({
    personsUsualBehaviour: z
      .string({ message: req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(
        maxLengthChars,
        `Description of the prisoner’s usual behaviour presentation must be ${maxLengthChars.toLocaleString()} characters or less`,
      )
      .refine(val => val && val.trim().length > 0, req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
