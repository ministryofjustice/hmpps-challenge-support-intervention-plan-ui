import express, { Router } from 'express'

export default function redirectCheckAnswersMiddleware(): Router {
  const router = express.Router({ mergeParams: true })

  router.use((req, res, next) => {
    const resRender = res.render
    res.render = (view: string, options?) => {
      if (options && 'backUrl' in options && req.journeyData.checkAnswers) {
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
      resRedirect.call(res, req.journeyData.checkAnswers ? 'check-answers' : url, status || 302)
    }
    next()
  })
  return router
}
