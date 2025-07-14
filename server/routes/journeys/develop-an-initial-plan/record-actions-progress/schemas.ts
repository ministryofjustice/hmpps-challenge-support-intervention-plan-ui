import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { firstNameSpaceLastName } from '../../../../utils/miniProfileUtils'
import { possessiveComma } from '../../../../utils/utils'

const TOO_LONG_ERROR_MSG = 'Actions and progress must be 4,000 characters or less'

export const schemaFactory = async (_: Request, res: Response) => {
  const PROGRESSION_ERROR_MSG = `Enter ${possessiveComma(firstNameSpaceLastName(res.locals.prisoner!))} input, actions and progress`
  return createSchema({
    progression: z
      .string()
      .max(4000, TOO_LONG_ERROR_MSG)
      .refine(val => val?.trim().length > 0, { message: PROGRESSION_ERROR_MSG })
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
