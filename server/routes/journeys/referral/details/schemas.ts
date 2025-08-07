import { z } from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import { parse24Hour, parseMinute } from '../../../../utils/datetimeUtils'
import {
  createSchema,
  validateAndTransformReferenceData,
  validateTransformPastDate,
} from '../../../../middleware/validationMiddleware'

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

  const INCIDENT_DATE_INVALID_MSG = req.journeyData.referral!.isProactiveReferral
    ? 'Date of the most recent occurrence must be a real date'
    : 'Date of the incident must be a real date'

  const incidentLocationMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-location')).map(itm => [itm.code, itm]),
  )
  const incidentTypeMap = new Map(
    (await csipApiService.getReferenceData(req, 'incident-type')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    incidentDate: validateTransformPastDate(INCIDENT_DATE_MSG, INCIDENT_DATE_INVALID_MSG, INCIDENT_DATE_FUTURE_MSG),
    // Add direct validation for hour field to catch values like "25"
    hour: z.string().superRefine((val, ctx) => {
      // Only validate when hour has a value
      if (val && !parse24Hour(val).success) {
        // Add the issue to 'incidentTime-hour' (which is the field name expected by the template)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a time using the 24-hour clock',
          path: ['incidentTime-hour'], // Add error to the special field
        })
      }
    }),
    minute: z.string(),
    // Add explicit error field that will match the template's expected field name
    'incidentTime-hour': z.string().optional(),
    incidentLocation: z
      .string({ message: INCIDENT_LOCATION_MSG })
      .transform(validateAndTransformReferenceData(incidentLocationMap, INCIDENT_LOCATION_MSG)),
    incidentType: z
      .string({ message: INCIDENT_TYPE_MSG })
      .transform(validateAndTransformReferenceData(incidentTypeMap, INCIDENT_TYPE_MSG)),
  })
    .superRefine((val, ctx) => {
      // Case 1: Both hour and minute are provided but at least one is invalid
      if (
        val.hour?.length &&
        val.minute?.length &&
        (!parse24Hour(val.hour).success || !parseMinute(val.minute).success)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a time using the 24-hour clock',
          path: ['incidentTime-hour'],
        })
      }

      // Case 2: Only one of hour or minute is provided (incomplete time)
      else if (!!val.hour?.length !== !!val.minute?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a time using the 24-hour clock',
          path: ['incidentTime-hour'],
        })
      }
    })
    .transform(val => {
      const hour = val.hour?.length ? parse24Hour(val.hour) : null
      const minute = val.minute?.length ? parseMinute(val.minute) : null
      const incidentTime = hour?.success && minute?.success ? `${hour.data}:${minute.data}:00` : null
      return { ...val, incidentTime }
    })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
