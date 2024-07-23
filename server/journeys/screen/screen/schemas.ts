import z from 'zod'
import { Request } from 'express'
import type CsipApiService from '../../../services/csipApi/csipApiService'

const csrfSchema = z.object({
  _csrf: z.string().optional(),
})

const outcomeTypeErrorMsg = 'Select the outcome of Safer Custody screening'
const REASONS_MSG = 'Enter a description of the reasons for this decision'

const REASONS_TOO_LONG_MSG = 'Description must be 4,000 characters or less'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const outcomeTypeMap = new Map(
    (await csipApiService.getReferenceData(req, 'outcome-type')).map(itm => [itm.code, itm]),
  )

  return z
    .object({
      outcomeType: z.string({ message: outcomeTypeErrorMsg }).transform((val, ctx) => {
        if (!outcomeTypeMap.has(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: outcomeTypeErrorMsg,
          })
          return z.NEVER
        }
        return outcomeTypeMap.get(val)!
      }),
    })
    .and(
      csrfSchema.merge(
        z.object({
          reasonForDecision: z
            .string({ message: REASONS_MSG })
            .max(4000, REASONS_TOO_LONG_MSG)
            .trim()
            .min(1, { message: REASONS_MSG }),
        }),
      ),
    )
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
