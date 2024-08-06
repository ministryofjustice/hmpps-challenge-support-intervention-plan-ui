import z from 'zod'
import { Request } from 'express'
import { AsyncReturnType } from 'type-fest'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { parse24Hour, parseDate, parseMinute, todayString } from '../../../utils/datetimeUtils'
import { createSchema, validateAndTransformReferenceData } from '../../../middleware/validationMiddleware'

export const schemaFactory = (csipApiService: CsipApiService) => async (req: Request) => {
  const INCIDENT_LOCATION_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Select the location of the most recent occurrence'
    : 'Select the location of the incident'

  const INCIDENT_TYPE_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Select the main concern'
    : 'Select the incident type'

  const INCIDENT_DATE_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Enter the date of the most recent occurrence'
    : 'Enter the date of the incident'

  const INCIDENT_DATE_FUTURE_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Date of the most recent occurrence must be today or in the past'
    : 'Date of the incident must be today or in the past'

  const incidentLocationMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-location')).map(itm => [itm.code, itm]),
  )
  const incidentTypeMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-type')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    incidentDate: z.string({ message: INCIDENT_DATE_MSG }).transform((val, ctx) => {
      const result = parseDate(val)
      if (!result.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INCIDENT_DATE_MSG })
        return z.NEVER
      }
      if (result.data! > todayString()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INCIDENT_DATE_FUTURE_MSG })
        return z.NEVER
      }
      return result.data
    }),
    hour: z.string().transform(val => (val?.length ? parse24Hour(val) : null)),
    minute: z.string().transform(val => (val?.length ? parseMinute(val) : null)),
    incidentLocation: z
      .string({ message: INCIDENT_LOCATION_MSG })
      .transform(validateAndTransformReferenceData(incidentLocationMap, INCIDENT_LOCATION_MSG)),
    incidentType: z
      .string({ message: INCIDENT_TYPE_MSG })
      .transform(validateAndTransformReferenceData(incidentTypeMap, INCIDENT_TYPE_MSG)),
  })
    .refine(val => (!val.hour && !val.minute) || (val.hour?.success && val.minute?.success), {
      message: 'Enter a time using the 24-hour clock',
      path: ['incidentTime'],
    })
    .transform(val => ({
      ...val,
      incidentTime: val.hour?.success && val.minute?.success ? `${val.hour.data}:${val.minute.data}` : null,
    }))
}

export type SchemaType = z.infer<AsyncReturnType<ReturnType<typeof schemaFactory>>>
