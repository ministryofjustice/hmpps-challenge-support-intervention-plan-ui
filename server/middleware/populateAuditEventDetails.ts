import { RequestHandler } from 'express'

export const populateAuditEventDetails = (): RequestHandler => {
  return async (req, res, next) => {
    res.locals.auditEvent = {
      ...res.locals?.auditEvent,
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        ...res.locals?.auditEvent?.details,
        activeCaseLoadId: res.locals.user.activeCaseLoadId,
      },
    }
    next()
  }
}
