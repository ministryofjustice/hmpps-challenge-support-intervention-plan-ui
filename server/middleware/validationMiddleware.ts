import { RequestHandler, Request } from 'express'
import z, { RefinementCtx } from 'zod'
import { isValid, isBefore, parseISO, isAfter } from 'date-fns'

export type fieldErrors = {
  [field: string | number | symbol]: string[] | undefined
}
export const buildErrorSummaryList = (array: fieldErrors) => {
  if (!array) return null
  return Object.entries(array).map(([field, error]) => ({
    text: error?.[0],
    href: `#${field}`,
  }))
}

export const findError = (errors: fieldErrors, fieldName: string) => {
  if (!errors?.[fieldName]) {
    return null
  }
  return {
    text: errors[fieldName]?.[0],
  }
}

export const customErrorOrderBuilder = (errorSummaryList: { href: string }[], order: string[]) =>
  order.map(key => errorSummaryList.find(error => error.href === `#${key}`)).filter(Boolean)

export const createSchema = <T = object>(shape: T) => zodAlwaysRefine(zObjectStrict(shape))

const zObjectStrict = <T = object>(shape: T) => z.object({ _csrf: z.string().optional(), ...shape }).strict()

/*
 * Ensure that all parts of the schema get tried and can fail before exiting schema checks - this ensures we don't have to
 * have complicated schemas if we want to both ensure the order of fields and have all the schema validation run
 * more info regarding this issue and workaround on: https://github.com/colinhacks/zod/issues/479#issuecomment-2067278879
 */
const zodAlwaysRefine = <T extends z.ZodTypeAny>(zodType: T) =>
  z.any().transform((val, ctx) => {
    const res = zodType.safeParse(val)
    if (!res.success) res.error.issues.forEach(ctx.addIssue)
    return res.data || val
  }) as unknown as T

export const validateAndTransformReferenceData =
  <T>(refDataMap: Map<string, T>, errorMessage: string) =>
  (val: string, ctx: RefinementCtx) => {
    if (!refDataMap.has(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
      })
      return z.NEVER
    }
    return refDataMap.get(val)!
  }

export type SchemaFactory = (request: Request) => Promise<z.ZodTypeAny>

export const validate = (schema: z.ZodTypeAny | SchemaFactory): RequestHandler => {
  return async (req, res, next) => {
    if (!schema) {
      return next()
    }
    const resolvedSchema = typeof schema === 'function' ? await schema(req) : schema
    const result = resolvedSchema.safeParse(req.body)
    if (result.success) {
      req.body = result.data
      return next()
    }
    req.flash('formResponses', JSON.stringify(req.body))

    const deduplicatedFieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, [...new Set(value || [])]]),
    )
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.error(
        `There were validation errors: ${JSON.stringify(result.error.format())} || body was: ${JSON.stringify(req.body)}`,
      )
    }
    req.flash('validationErrors', JSON.stringify(deduplicatedFieldErrors))
    return res.redirect('back')
  }
}

export const validateDate = (
  requiredErr: string,
  invalidErr: string,
  maxErr: string,
  allowedValues: 'PAST' | 'FUTURE' | 'ALL',
) => {
  return z
    .string({ message: requiredErr })
    .min(1, { message: requiredErr })
    .transform(value => value.split(/[-/]/).reverse())
    .transform(value => {
      // Prefix month and date with a 0 if needed
      const month = value[1]?.length === 2 ? value[1] : `0${value[1]}`
      const date = value[2]?.length === 2 ? value[2] : `0${value[2]}`
      return `${value[0]}-${month}-${date}T00:00:00Z` // We put a full timestamp on it so it gets parsed as UTC time and the date doesn't get changed due to locale
    })
    .transform(date => parseISO(date))
    .superRefine((date, ctx) => {
      return isValid(date) || ctx.addIssue({ code: z.ZodIssueCode.custom, message: invalidErr })
    })
    .superRefine((date, ctx) => {
      if (allowedValues === 'ALL') {
        return true
      }
      if (allowedValues === 'PAST') {
        return isBefore(date, new Date()) || ctx.addIssue({ code: z.ZodIssueCode.custom, message: maxErr })
      }
      const today = new Date()
      today.setHours(0)
      today.setMinutes(0)
      today.setSeconds(0)
      today.setMilliseconds(0)
      return isAfter(date, today) || ctx.addIssue({ code: z.ZodIssueCode.custom, message: maxErr })
    })
    .transform(date => date.toISOString().substring(0, 10))
}
