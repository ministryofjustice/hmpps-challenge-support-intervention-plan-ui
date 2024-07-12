import { RequestHandler, Router } from 'express'
import { ReferralContributoryFactorsCommentsController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

export const ReferralContributoryFactorsCommentsRoutes = (): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const controller = new ReferralContributoryFactorsCommentsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
