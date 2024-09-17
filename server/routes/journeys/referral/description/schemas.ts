import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThreshold } from '../../../../utils/appendFieldUtils'

const DESCRIPTION_OF_CONCERN_TOO_LONG_MSG = (length: number) =>
  `Description must be ${length.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThreshold(res.locals.user.displayName, req.journeyData.csipRecord?.referral.descriptionOfConcern)
        .maxLengthChars
    : 4000

  const DESCRIPTION_OF_CONCERN_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter a description of the behaviour and concerns'
    : 'Enter a description of the incident and concerns'

  return createSchema({
    descriptionOfConcern: z
      .string({ message: DESCRIPTION_OF_CONCERN_MSG })
      .max(maxLengthChars, DESCRIPTION_OF_CONCERN_TOO_LONG_MSG(maxLengthChars))
      .refine(val => val && val.trim().length > 0, DESCRIPTION_OF_CONCERN_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
