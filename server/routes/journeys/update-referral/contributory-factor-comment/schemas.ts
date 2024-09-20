import z from 'zod'
import { Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'
import { ContributoryFactor } from '../../../../@types/express'

export const schemaFactory = (res: Response, selectedCf: ContributoryFactor) => {
  const { maxLengthChars } = getMaxCharsAndThresholdForAppend(res.locals.user.displayName, selectedCf.comment)

  return createSchema({
    comment: z.string().max(maxLengthChars, `Comment must be ${maxLengthChars.toLocaleString()} characters or less`),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
