import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

const REFERRED_BY_ERROR_MESSAGE = "Enter the referrer's name"
const REFERRED_BY_LENGTH_ERROR_MESSAGE = "Referrer's name must be 240 characters or less"
const AREA_ERROR_MESSAGE = "Select the referrer's area of work"

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const areaRefDataMap = new Map(
    (await csipApiService.getReferenceData(req, 'area-of-work')).map(itm => [itm.code, itm]),
  )
  return createSchema({
    referredBy: z
      .string({ message: REFERRED_BY_ERROR_MESSAGE })
      .max(240, REFERRED_BY_LENGTH_ERROR_MESSAGE)
      .refine(val => val && val.trim().length > 0, REFERRED_BY_ERROR_MESSAGE),
    areaOfWork: z
      .string({ message: AREA_ERROR_MESSAGE })
      .transform(validateAndTransformReferenceData(areaRefDataMap, AREA_ERROR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
