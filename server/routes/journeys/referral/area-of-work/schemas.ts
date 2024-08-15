import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../../middleware/validationMiddleware'

const ERROR_MESSAGE = 'Select your area of work'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const areaRefDataMap = new Map(
    (await csipApiService.getReferenceData(req, 'area-of-work')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    areaOfWork: z
      .string({ message: ERROR_MESSAGE })
      .transform(validateAndTransformReferenceData(areaRefDataMap, ERROR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
