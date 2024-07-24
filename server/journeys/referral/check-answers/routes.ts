import { RequestHandler, Router } from 'express'
import { ReferralCheckAnswersController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type CsipApiService from '../../../services/csipApi/csipApiService'

export const ReferralCheckAnswersRoutes = (csipApiService: CsipApiService): Router => {
  const router = Router({ mergeParams: true })

  const controller = new ReferralCheckAnswersController(csipApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) =>
    router.post(path, controller.checkSubmitToAPI, asyncMiddleware(handler))

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
