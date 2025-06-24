import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

const INTERVENTION_REQUIRED_MSG = 'Enter an update on the planned intervention'

const TOO_LONG_ERROR_MSG = (maxLengthChars: number) =>
  `Update to the planned intervention must be ${maxLengthChars.toLocaleString()} characters or less`

export const schemaFactory = async (req: Request, res: Response) => {
  const { identifiedNeedUuid } = req.params
  const identifiedNeed = req.journeyData.csipRecord!.plan!.identifiedNeeds.find(
    need => need.identifiedNeedUuid === identifiedNeedUuid,
  )

  const maxLengthChars = req.journeyData.isUpdate
    ? getMaxCharsAndThresholdForAppend(res.locals.user.displayName, identifiedNeed?.intervention).maxLengthChars
    : 4000

  return createSchema({
    intervention: z
      .string({ message: INTERVENTION_REQUIRED_MSG })
      .max(maxLengthChars, TOO_LONG_ERROR_MSG(maxLengthChars))
      .refine(val => val?.trim().length > 0, { message: INTERVENTION_REQUIRED_MSG }),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
