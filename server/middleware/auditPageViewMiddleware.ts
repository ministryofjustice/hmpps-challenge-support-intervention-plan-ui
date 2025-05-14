import { RequestHandler } from 'express'
import AuditService from '../services/auditService'

export const auditPageViewMiddleware = (auditService: AuditService): RequestHandler => {
  return async (req, res, next) => {
    res.locals.auditEvent = {
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        pageUrl: req.originalUrl,
      },
    }

    res.prependOnceListener('close', async () => {
      await auditService.logPageView(req.journeyData, req.query, res.locals.auditEvent, true)
    })

    type resRenderCb = (view: string, options?: object, callback?: (err: Error, html: string) => void) => void
    const resRender = res.render as resRenderCb
    res.render = (view: string, options?) => {
      resRender.call(res, view, options, async (err: Error, html: string) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        await auditService.logPageView(req.journeyData, req.query, res.locals.auditEvent)
        res.send(html)
      })
    }
    next()
  }
}
