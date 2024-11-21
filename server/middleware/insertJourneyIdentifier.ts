import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidV4, validate } from 'uuid'

export default function insertJourneyIdentifier() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.url.split('/')[1] || '/'
    if (!validate(uuid)) {
      return res.redirect(`${req.baseUrl}/${uuidV4()}${req.url}`)
    }
    res.locals.auditEvent.pageNameSuffix = `${req.url.split('/')[1]}_${req.url.replace(/\?.*/, '').split('/').slice(2)}` // JOURNEYID_PAGE
    return next()
  }
}
