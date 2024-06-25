import { RequestHandler } from 'express'
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

export const validate = <T extends z.ZodTypeAny>(schema: T): RequestHandler => {
  return async (req, res, next) => {
    if (!schema) {
      return next()
    }
    const result = schema.safeParse(req.body)
    if (result.success) {
      req.body = result.data
      return next()
    }
    req.flash('formResponses', JSON.stringify(req.body))
    req.flash('validationErrors', JSON.stringify(result.error.flatten().fieldErrors))
    return res.redirect('back')
  }
}
