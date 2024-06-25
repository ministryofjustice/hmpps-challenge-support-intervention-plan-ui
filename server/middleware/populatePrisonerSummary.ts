import { RequestHandler } from 'express'

export default function populatePrisonerSummary(): RequestHandler {
  return async (req, res, next) => {
    if (req.journeyData.prisoner) {
      res.locals['prisoner'] = req.journeyData.prisoner
    }
    next()
  }
}
