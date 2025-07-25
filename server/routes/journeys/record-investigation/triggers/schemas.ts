import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const ERROR_MSG = 'Enter a description of the prisoner’s risks and triggers'
const UPDATE_ERROR_MSG = 'Enter an update about the prisoner’s risks and triggers'
const TOO_LONG_ERROR_MSG = (isUpdate: boolean | undefined, maxLengthChars: number) =>
  `${isUpdate ? 'Update about' : 'Description of'} the prisoner’s risks and triggers must be ${maxLengthChars.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.investigation?.personsTrigger,
      ).maxLengthChars
    : 4000

  return createSchema({
    personsTrigger: z
      .string({ message: req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG })
      .max(maxLengthChars, TOO_LONG_ERROR_MSG(req.journeyData.isUpdate, maxLengthChars))
      .refine(val => val && val.trim().length > 0, req.journeyData.isUpdate ? UPDATE_ERROR_MSG : ERROR_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
