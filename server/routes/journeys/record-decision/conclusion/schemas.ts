import z from 'zod'
import { Request } from 'express'
import { createSchema, validateAndTransformReferenceData } from '../../../../middleware/validationMiddleware'
import CsipApiService from '../../../../services/csipApi/csipApiService'

const CONCLUSION_REQUIRED_MSG = 'Enter a description of the reasons for the decision'
const CONCLUSION_TOO_LONG_ERROR_MSG = 'Description of the reasons for the decision must be 4,000 characters or less'

const OUTCOME_REQUIRED_MSG = 'Select the conclusion of the CSIP investigation'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const outcomeTypeMap = new Map(
    (await csipApiService.getReferenceData(req, 'decision-outcome-type')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    outcome: z
      .string({ message: OUTCOME_REQUIRED_MSG })
      .transform(validateAndTransformReferenceData(outcomeTypeMap, OUTCOME_REQUIRED_MSG)),

    conclusion: z
      .string({ message: CONCLUSION_REQUIRED_MSG })
      .max(4000, CONCLUSION_TOO_LONG_ERROR_MSG)
      .refine(val => val?.trim().length > 0, { message: CONCLUSION_REQUIRED_MSG }),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
