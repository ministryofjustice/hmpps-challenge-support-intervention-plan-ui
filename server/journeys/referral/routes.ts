import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { ReferralRootController } from './controller'
import { OnBehalfOfRoutes } from './on-behalf-of/routes'

function Routes(): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const referralRootController = new ReferralRootController()

  get('/', referralRootController.GET)

  return router
}

export default function routes(): Router {
  const router = Router({ mergeParams: true })

  router.use('/', Routes())

  router.use('/on-behalf-of', OnBehalfOfRoutes())

  return router
}
