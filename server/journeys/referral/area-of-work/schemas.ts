import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'

export const schemaFactory =
  (csipApiService: CsipApiService) =>
  async (req: Request): Promise<z.ZodTypeAny> => {
    const areaRefDataMap = new Map(
      (await csipApiService.getReferenceData(req, 'area-of-work')).map(itm => [itm.code, itm]),
    )

    return z.object({
      areaOfWork: z
        .string({ message: 'Select your area of work' })
        .min(1, 'Select your area of work')
        .max(12, 'Select your area of work')
        .refine(val => areaRefDataMap.has(val), 'Select your area of work')
        .transform(val => areaRefDataMap.get(val)),
    })
  }
