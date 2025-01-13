import { z } from 'zod'
import { Request } from 'express'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../../middleware/validationMiddleware'

const EMPTY_STAFF_MEMBER_ERROR_MSG = `Enter the names of staff assaulted`
const TOO_LONG_STAFF_MEMBER_ERROR_MSG = `Names of staff assaulted must be 240 characters or less`

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const incidentInvolvementMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-involvement')).map(itm => [itm.code, itm]),
  )

  const isProactive = !!req.journeyData.referral!.isProactiveReferral
  const INVOLVEMENT_TYPE_ERROR_MSG = `Select how the prisoner ${isProactive ? 'has been involved in the behaviour' : 'was involved in the incident'}`
  const IS_STAFF_ASSAULTED_ERROR_MSG = `Select if any staff were assaulted ${isProactive ? 'as a result of the behaviour' : 'during the incident'} or not`

  return createSchema({
    involvementType: z
      .string({ message: INVOLVEMENT_TYPE_ERROR_MSG })
      .transform(validateAndTransformReferenceData(incidentInvolvementMap, INVOLVEMENT_TYPE_ERROR_MSG)),
    isStaffAssaulted: z
      .string({ message: IS_STAFF_ASSAULTED_ERROR_MSG })
      .trim()
      .refine(val => ['false', 'true'].includes(val), { message: IS_STAFF_ASSAULTED_ERROR_MSG }),
    assaultedStaffName: z.string(),
  })
    .superRefine((val, ctx) => {
      if (val.isStaffAssaulted === 'true') {
        if (!val.assaultedStaffName?.trim().length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: EMPTY_STAFF_MEMBER_ERROR_MSG,
            path: ['assaultedStaffName'],
          })
        } else if (val.assaultedStaffName?.length > 240) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: TOO_LONG_STAFF_MEMBER_ERROR_MSG,
            path: ['assaultedStaffName'],
          })
        }
      }
    })
    .transform(val => ({
      ...val,
      isStaffAssaulted: val.isStaffAssaulted === 'true',
      assaultedStaffName: val.isStaffAssaulted === 'true' ? val.assaultedStaffName : null,
    }))
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
