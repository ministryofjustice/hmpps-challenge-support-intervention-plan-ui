import express, { Router } from 'express'

export default function redirectCheckAnswersMiddleware(excludePaths: RegExp[] = []): Router {
  const router = express.Router({ mergeParams: true })

  router.use((req, res, next) => {
    if (req.originalUrl && !excludePaths.some(itm => req.originalUrl.match(itm))) {
      const resRender = res.render
      res.render = (view: string, options?) => {
        if (options && 'backUrl' in options && req.journeyData.isCheckAnswers) {
          resRender.call(res, view, { ...options, backUrl: 'check-answers' } as never)
        } else {
          resRender.call(res, view, options as never)
        }
      }

      const resRedirect = res.redirect
      res.redirect = (param1: string | number, param2?: string | number) => {
        const url = (typeof param1 === 'string' ? param1 : param2) as string
        // eslint-disable-next-line no-nested-ternary
        const status = typeof param1 === 'number' ? param1 : typeof param2 === 'number' ? param2 : undefined
        resRedirect.call(res, req.journeyData.isCheckAnswers ? 'check-answers' : url, status || 302)
        const errors = req.flash('validationErrors')
        if (errors.length) {
          req.flash('validationErrors', errors[0]!)
        }
        resRedirect.call(res, req.journeyData.isCheckAnswers && !errors.length ? 'check-answers' : url, status || 302)
      }
    }
    next()
  })
  return router
}
