import { RequestHandler, Router } from 'express'
import { ReferralOnBehalfOfController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

export const OnBehalfOfRoutes = (): Router => {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const referralRootController = new ReferralOnBehalfOfController()

  get('/', referralRootController.GET)

  return router
}
