import z from 'zod'
import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { parse24Hour, parseMinute } from '../../../utils/datetimeUtils'

export const schemaFactory =
  (csipApiService: CsipApiService) =>
  async (req: Request): Promise<z.ZodTypeAny> => {
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

    return z
      .object({
        incidentDate: z
          .string({ message: INCIDENT_DATE_MSG })
          .min(8, { message: INCIDENT_DATE_MSG })
          .max(10, { message: INCIDENT_DATE_MSG })
          .transform(value => value.split(/[-/]/).reverse())
          .transform(value => {
            // Prefix month and date with a 0 if needed
            const month = value[1]?.length === 2 ? value[1] : `0${value[1]}`
            const date = value[2]?.length === 2 ? value[2] : `0${value[2]}`
            return `${value[0]}-${month}-${date}T00:00:00Z` // We put a full timestamp on it so it gets parsed as UTC time and the date doesn't get changed due to locale
          })
          .pipe(
            z.coerce
              .date({
                errorMap: (issue, ctx) => {
                  if (issue.code === 'invalid_date') {
                    return { message: INCIDENT_DATE_INVALID_MSG }
                  }
                  return { message: ctx.defaultError }
                },
              })
              .max(new Date(), { message: INCIDENT_DATE_FUTURE_MSG }),
          )
          .transform(dateString => dateString.toISOString().substring(0, 10)),
        hour: z.string().transform(val => (val?.length ? parse24Hour(val) : null)),
        minute: z.string().transform(val => (val?.length ? parseMinute(val) : null)),
        incidentLocation: z
          .string({ message: INCIDENT_LOCATION_MSG })
          .refine(val => incidentLocationMap.has(val), INCIDENT_LOCATION_MSG)
          .transform(val => incidentLocationMap.get(val)),
        incidentType: z
          .string({ message: INCIDENT_TYPE_MSG })
          .refine(val => incidentTypeMap.has(val), INCIDENT_TYPE_MSG)
          .transform(val => incidentTypeMap.get(val)),
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
