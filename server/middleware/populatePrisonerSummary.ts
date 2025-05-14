import { RequestHandler } from 'express'

export default function populatePrisonerSummary(): RequestHandler {
  return async (req, res, next) => {
    if (req.journeyData.prisoner) {
      res.locals['prisoner'] = req.journeyData.prisoner
      if (res.locals.auditEvent) {
        res.locals.auditEvent.subjectId = req.journeyData.prisoner.prisonerNumber
        res.locals.auditEvent.subjectType = 'PRISONER_ID'
        res.locals.auditEvent.details = {
          ...res.locals.auditEvent.details,
          activeCaseLoadId: res.locals.user.activeCaseLoadId,
        }
      }
    }
    next()
  }
}
