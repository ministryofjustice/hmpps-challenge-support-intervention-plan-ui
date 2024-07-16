import { RequestHandler, Router } from 'express'
import { ReferralProactiveOrReactiveController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import redirectCheckAnswersMiddleware from '../../base/redirectCheckAnswersMiddleware'

export const ReferralProactiveOrReactiveRoutes = (): Router => {
  const router = Router({ mergeParams: true }).use(redirectCheckAnswersMiddleware())

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, validate(schema), asyncMiddleware(handler))

  const controller = new ReferralProactiveOrReactiveController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
