import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'

const ERROR_MESSAGE = 'Select the contributory factors'

export const schemaFactory =
  (csipApiService: CsipApiService) =>
  async (req: Request): Promise<z.ZodTypeAny> => {
    const refDataMap = new Map(
      (await csipApiService.getReferenceData(req, 'contributory-factor-type')).map(itm => [itm.code, itm]),
    )
    return z.object({
      contributoryFactors: z.union(
        [
          z
            .string()
            .refine(val => refDataMap.has(val), ERROR_MESSAGE)
            .transform(val => [{ factorType: refDataMap.get(val) }]),
          z
            .array(z.string())
            .refine(val => val.every(element => refDataMap.has(element)), ERROR_MESSAGE)
            .transform(val => val.map(element => ({ factorType: refDataMap.get(element) }))),
        ],
        { message: ERROR_MESSAGE },
      ),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
