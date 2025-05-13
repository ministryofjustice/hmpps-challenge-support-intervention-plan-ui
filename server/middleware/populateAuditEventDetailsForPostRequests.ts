import { RequestHandler } from 'express'

export const populateAuditEventDetailsForPostRequests = (): RequestHandler => {
  return async (req, res, next) => {
    res.locals.auditEvent = {
      who: res.locals.user.username,
      correlationId: req.id,
      details: {
        activeCaseLoadId: res.locals.user.activeCaseLoadId,
      },
    }
    next()
  }
}
