import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

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
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
