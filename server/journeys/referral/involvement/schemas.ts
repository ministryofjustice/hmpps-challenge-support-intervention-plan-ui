import z from 'zod'
import { Request } from 'express'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

const EMPTY_STAFF_MEMBER_ERROR_MSG = `Enter the staff member's name`
const TOO_LONG_STAFF_MEMBER_ERROR_MSG = `Staff member's name must be 240 characters or less`

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const incidentInvolvementMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-involvement')).map(itm => [itm.code, itm]),
  )

  const isProactive = !!req.journeyData?.referral?.isProactiveReferral
  const INVOLVEMENT_TYPE_ERROR_MSG = `Select how the prisoner ${isProactive ? 'has been involved in the behaviour' : 'was involved in the incident'}`
  const IS_STAFF_ASSAULTED_ERROR_MSG = `Select if any staff were assaulted ${isProactive ? 'as a result of the behaviour' : 'during the incident'} or not`

  return createSchema({
    involvementType: z
      .string({ message: INVOLVEMENT_TYPE_ERROR_MSG })
      .transform(validateAndTransformReferenceData(incidentInvolvementMap, INVOLVEMENT_TYPE_ERROR_MSG)),
    staffAssaulted: z
      .string({ message: IS_STAFF_ASSAULTED_ERROR_MSG })
      .trim()
      .refine(val => ['false', 'true'].includes(val), { message: IS_STAFF_ASSAULTED_ERROR_MSG }),
    assaultedStaffName: z.string().max(240, { message: TOO_LONG_STAFF_MEMBER_ERROR_MSG }),
  })
    .refine(val => val.staffAssaulted === 'false' || val.assaultedStaffName?.trim().length > 0, {
      message: EMPTY_STAFF_MEMBER_ERROR_MSG,
      path: ['assaultedStaffName'],
    })
    .transform(val => ({
      ...val,
      staffAssaulted: val.staffAssaulted === 'true',
      assaultedStaffName: val.staffAssaulted === 'true' ? val.assaultedStaffName : null,
    }))
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
