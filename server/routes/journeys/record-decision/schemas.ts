import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

const ERROR_MESSAGE = 'Select who’s signing off on the decision'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const refDataMap = new Map((await csipApiService.getReferenceData(req, 'role')).map(itm => [itm.code, itm]))

  return createSchema({
    signedOffByRole: z
      .string({ message: ERROR_MESSAGE })
      .transform(validateAndTransformReferenceData(refDataMap, ERROR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
