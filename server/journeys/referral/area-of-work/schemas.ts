import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'

const ERROR_MESSAGE = 'Select your area of work'

export const schemaFactory =
  (csipApiService: CsipApiService) =>
  async (req: Request): Promise<z.ZodTypeAny> => {
    const areaRefDataMap = new Map(
      (await csipApiService.getReferenceData(req, 'area-of-work')).map(itm => [itm.code, itm]),
    )

    return z.object({
      areaOfWork: z
        .string({ message: ERROR_MESSAGE })
        .refine(val => areaRefDataMap.has(val), ERROR_MESSAGE)
        .transform(val => areaRefDataMap.get(val)),
    })
  }
