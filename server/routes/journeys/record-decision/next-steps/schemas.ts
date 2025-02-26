import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const UPDATE_ERROR_MSG = 'Enter an update on next steps'

export const schemaFactory = async (req: Request, res: Response, isChange?: boolean) => {
  const { isUpdate, csipRecord } = req.journeyData
  const maxLengthChars =
    isUpdate && !isChange
      ? getMaxCharsAndThresholdForAppend(
          res.locals.user.displayName,
          csipRecord?.referral?.decisionAndActions?.nextSteps,
        ).maxLengthChars
      : 4000

  return createSchema({
    nextSteps: z
      .string()
      .max(
        maxLengthChars,
        `${isUpdate && !isChange ? 'Update' : 'Comments'} on next steps must be ${maxLengthChars.toLocaleString()} characters or less`,
      )
      .refine(val => (val && val.trim().length > 0) || !isUpdate || isChange, UPDATE_ERROR_MSG)
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
