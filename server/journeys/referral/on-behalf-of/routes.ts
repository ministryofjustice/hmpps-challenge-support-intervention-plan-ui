import { RequestHandler, Router } from 'express'
import { ReferralOnBehalfOfController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'

export const OnBehalfOfRoutes = (): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, validate(schema), asyncMiddleware(handler))

  const referralOnBehalfOfController = new ReferralOnBehalfOfController()

  get('/', referralOnBehalfOfController.GET)
  post('/', referralOnBehalfOfController.POST)

  return router
}
