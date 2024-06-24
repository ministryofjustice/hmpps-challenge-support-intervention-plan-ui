import { RequestHandler } from 'express'
import z from 'zod'

export const validate = <T extends z.ZodTypeAny>(schema: T): RequestHandler => {
  return async (req, res, next) => {
    console.log('in validation')
    if (!schema) {
      return next()
    }
    console.log('validating')
    const result = schema.safeParse(req.body)
    if (result.success) {
      console.log('ok!')
      req.body = result.data
      return next()
    }
    console.log('not ok!')
    console.log(`JSON.stringify(result.error.flatten()): ${JSON.stringify(result.error.flatten())}`)
    res.locals['validationErrors'] = JSON.stringify(result.error.flatten())
    req.flash('validationErrors', JSON.stringify(result.error.flatten()))
    res.locals['formResponses'] = JSON.stringify(req.body)
    req.flash('formResponses', JSON.stringify(req.body))
    return res.redirect('back')
  }
}
