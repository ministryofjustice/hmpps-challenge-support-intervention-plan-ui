import z from 'zod'
import { Request } from 'express'
import type CsipApiService from '../../../services/csipApi/csipApiService'

const csrfSchema = z.object({
  _csrf: z.string().optional(),
})
const involvementTypeErrorMsg = `Select how the prisoner has been involved in the behaviour`
const isStaffAssaultedErrorMsg = `Select if any staff were assaulted as a result of the behaviour or not`
const emptyStaffMemberErrorMsg = `Enter the staff member's name`
const tooLongStaffMemberErrorMsg = `Staff member's name must be 240 characters or less`

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const incidentInvolvementMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-involvement')).map(itm => [itm.code, itm]),
  )

  return csrfSchema
    .merge(
      z.object({
        involvementType: z.string({ message: involvementTypeErrorMsg }).transform((val, ctx) => {
          if (!incidentInvolvementMap.has(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: involvementTypeErrorMsg,
            })
            return z.NEVER
          }
          return incidentInvolvementMap.get(val)!
        }),
        staffAssaulted: z
          .string({ message: isStaffAssaultedErrorMsg })
          .trim()
          .refine(val => ['false', 'true'].includes(val), { message: isStaffAssaultedErrorMsg }),
        assaultedStaffName: z.string().max(240, { message: tooLongStaffMemberErrorMsg }),
      }),
    )
    .strict()
    .refine(val => val.staffAssaulted === 'false' || val.assaultedStaffName?.trim().length > 0, {
      message: emptyStaffMemberErrorMsg,
      path: ['assaultedStaffName'],
    })
    .transform(val => ({
      ...val,
      staffAssaulted: val.staffAssaulted === 'true',
      assaultedStaffName: val.staffAssaulted === 'true' ? val.assaultedStaffName : null,
    }))
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
