import { RequestHandler } from 'express'

export default function populatePrisonerSummary(): RequestHandler {
  return async (req, res, next) => {
    if (req.journeyData.prisoner) {
      res.locals['prisoner'] = req.journeyData.prisoner
      res.locals.auditEvent.subjectId = req.journeyData.prisoner.prisonerNumber
      res.locals.auditEvent.subjectType = req.journeyData.prisoner.prisonerNumber
      res.locals.auditEvent.details = {
        ...res.locals.auditEvent.details,
        prisonerNumber: req.journeyData.prisoner.prisonerNumber,
      }
    }
    next()
  }
}
