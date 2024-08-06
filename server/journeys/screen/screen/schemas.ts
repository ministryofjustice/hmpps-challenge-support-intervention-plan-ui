import z from 'zod'
import { Request } from 'express'
import { AsyncReturnType } from 'type-fest'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

const OUTCOME_TYPE_ERROR_MSG = 'Select the outcome of Safer Custody screening'
const REASONS_MSG = 'Enter a description of the reasons for this decision'
const REASONS_TOO_LONG_MSG = 'Description must be 4,000 characters or less'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const outcomeTypeMap = new Map(
    (await csipApiService.getReferenceData(req, 'outcome-type')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    outcomeType: z
      .string({ message: OUTCOME_TYPE_ERROR_MSG })
      .transform(validateAndTransformReferenceData(outcomeTypeMap, OUTCOME_TYPE_ERROR_MSG)),
    reasonForDecision: z
      .string({ message: REASONS_MSG })
      .max(4000, REASONS_TOO_LONG_MSG)
      .refine(val => val && val.trim().length > 0, REASONS_MSG),
  })
}

export type SchemaType = z.infer<AsyncReturnType<ReturnType<typeof schemaFactory>>>
