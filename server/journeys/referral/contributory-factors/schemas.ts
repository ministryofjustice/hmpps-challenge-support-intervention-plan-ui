import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { ContributoryFactor } from '../../../@types/express'
import { createSchema } from '../../../middleware/validationMiddleware'

const ERROR_MESSAGE = 'Select the contributory factors'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const refDataMap = new Map(
    (await csipApiService.getReferenceData(req, 'contributory-factor-type')).map(itm => [itm.code, itm]),
  )
  return createSchema({
    contributoryFactors: z.union(
      [
        z.string().transform<ContributoryFactor[]>((val, ctx) => {
          if (!refDataMap.has(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: ERROR_MESSAGE,
            })
            return z.NEVER
          }
          return [{ factorType: refDataMap.get(val)! }]
        }),
        z.array(z.string()).transform<ContributoryFactor[]>((val, ctx) => {
          if (!val.every(element => refDataMap.has(element))) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: ERROR_MESSAGE,
            })
            return z.NEVER
          }
          return val.map(element => ({ factorType: refDataMap.get(element)! }))
        }),
      ],
      { message: ERROR_MESSAGE },
    ),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
