import { RequestHandler, Router } from 'express'
import { ReferralReasonsController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'

export const ReferralReasonsRoutes = (): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) =>
    router.post(path, validate(schemaFactory), asyncMiddleware(handler))

  const controller = new ReferralReasonsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
