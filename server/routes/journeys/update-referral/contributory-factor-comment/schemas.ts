import { z } from 'zod'
import { Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'
import { ContributoryFactor } from '../../../../@types/express'

export const schemaFactory = (res: Response, selectedCf: ContributoryFactor) => {
  const { maxLengthChars } = getMaxCharsAndThresholdForAppend(res.locals.user.displayName, selectedCf.comment)
  const MIN_ERROR_MSG = `Enter an update to the comment on ${selectedCf.factorType.description} factors`

  return createSchema({
    comment: z
      .string()
      .max(maxLengthChars, `Update to the comment must be ${maxLengthChars.toLocaleString()} characters or less`)
      .refine(val => val && val.trim().length > 0, MIN_ERROR_MSG),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
