import { RequestHandler, Router } from 'express'
import { ConfirmationController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

export const ConfirmationRoutes = (): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const controller = new ConfirmationController()

  get('/', controller.GET)

  return router
}
