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
    req.flash('validationErrors', JSON.stringify(result.error.flatten().fieldErrors))
    return res.redirect('back')
  }
}
