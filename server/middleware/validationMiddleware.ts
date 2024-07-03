import { RequestHandler, Request } from 'express'
import z from 'zod'

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
  if (!errors) {
    return null
  }
  return {
    text: errors[fieldName]?.[0],
  }
}

export type SchemaFactory = (request: Request) => Promise<z.ZodTypeAny>

export const validate = (schema: z.ZodTypeAny | SchemaFactory): RequestHandler => {
  return async (req, res, next) => {
    if (!schema) {
      return next()
    }
    const result = (typeof schema === 'function' ? await schema(req) : schema).safeParse(req.body)
    if (result.success) {
      req.body = result.data
      return next()
    }
    req.flash('formResponses', JSON.stringify(req.body))
    const deduplicatedFieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, [...new Set(value || [])]]),
    )
    const errors = JSON.stringify(deduplicatedFieldErrors)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.error(`There were validation errors: ${JSON.stringify(deduplicatedFieldErrors)}`)
    }
    req.flash('validationErrors', errors)
    return res.redirect('back')
  }
}
