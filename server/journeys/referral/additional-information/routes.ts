import { RequestHandler, Router } from 'express'
import { ReferralAdditionalInformationController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'

export const ReferralAdditionalInformationRoutes = (): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, validate(schema), asyncMiddleware(handler))

  const controller = new ReferralAdditionalInformationController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}