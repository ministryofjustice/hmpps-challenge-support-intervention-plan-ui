import { RequestHandler, Request } from 'express'
import z, { RefinementCtx } from 'zod'

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

export const createSchema = <T = object>(shape: T) => zodAlwaysRefine(zObjectStrict(shape))

const zObjectStrict = <T = object>(shape: T) => z.object({ _csrf: z.string().optional(), ...shape }).strict()

const zodAlwaysRefine = <T extends z.ZodTypeAny>(zodType: T) =>
  z.any().transform((value, ctx) => {
    const res = zodType.safeParse(value)
    if (!res.success) res.error.issues.forEach(ctx.addIssue)
    return res.data || value
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
