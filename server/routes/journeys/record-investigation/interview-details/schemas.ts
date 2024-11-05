import z from 'zod'
import { Request } from 'express'
import {
  createSchema,
  validateAndTransformReferenceData,
  validateTransformPastDate,
} from '../../../../middleware/validationMiddleware'
import CsipApiService from '../../../../services/csipApi/csipApiService'

const INTERVIEW_TEXT_TOO_LONG_ERROR_MSG = 'Comments must be 4,000 characters or less'

const INTERVIEWEE_ROLE_REQUIRED_MSG = 'Select how the interviewee was involved'

const INTERVIEW_DATE_REQUIRED_MSG = 'Enter the date of the interview'
const INTERVIEW_DATE_INVALID_ERROR_MSG = 'Date of the interview must be a real date'
const INTERVIEW_DATE_FUTURE_ERROR_MSG = 'Date of the interview must be today or in the past'

const INTERVIEWEE_REQUIRED_MSG = 'Enter the interviewee’s name'
const INTERVIEWEE_TOO_LONG_ERROR_MSG = 'Interviewee’s name must be 100 characters or less'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const intervieweeRoleMap = new Map(
    (await csipApiService.getReferenceData(req, 'interviewee-role')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    interviewee: z
      .string({ message: INTERVIEWEE_REQUIRED_MSG })
      .max(100, INTERVIEWEE_TOO_LONG_ERROR_MSG)
      .refine(val => val?.trim().length > 0, { message: INTERVIEWEE_REQUIRED_MSG }),

    interviewDate: validateTransformPastDate(
      INTERVIEW_DATE_REQUIRED_MSG,
      INTERVIEW_DATE_INVALID_ERROR_MSG,
      INTERVIEW_DATE_FUTURE_ERROR_MSG,
    ),

    intervieweeRole: z
      .string({ message: INTERVIEWEE_ROLE_REQUIRED_MSG })
      .transform(validateAndTransformReferenceData(intervieweeRoleMap, INTERVIEWEE_ROLE_REQUIRED_MSG)),

    interviewText: z
      .string()
      .max(4000, INTERVIEW_TEXT_TOO_LONG_ERROR_MSG)
      .transform(val => (val?.trim().length ? val : null)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
