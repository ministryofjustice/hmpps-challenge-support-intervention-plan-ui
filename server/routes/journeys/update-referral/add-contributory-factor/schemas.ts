import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../../middleware/validationMiddleware'

const ERROR_MESSAGE = 'Select the contributory factor'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const refDataMap = new Map(
    (await csipApiService.getReferenceData(req, 'contributory-factor-type')).map(itm => [itm.code, itm]),
  )
  return createSchema({
    factorType: z
      .string({ message: ERROR_MESSAGE })
      .transform(validateAndTransformReferenceData(refDataMap, ERROR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
