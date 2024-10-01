import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const UPDATE_ERROR_MSG = 'Enter an update on next steps'

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord?.referral?.decisionAndActions?.nextSteps,
      ).maxLengthChars
    : 4000

  return createSchema({
    nextSteps: z
      .string()
      .max(maxLengthChars, `Comments on next steps must be ${maxLengthChars.toLocaleString()} characters or less`)
      .refine(val => (val && val.trim().length > 0) || !req.journeyData.isUpdate, UPDATE_ERROR_MSG)
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
