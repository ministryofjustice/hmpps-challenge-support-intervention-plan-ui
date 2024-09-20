import { NextFunction, Request, Response } from 'express'
import { UpdateContributoryFactorsCommentController } from './controller'
import { validate as validateSchema } from '../../../../middleware/validationMiddleware'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from './schemas'

export const UpdateContributoryFactorsCommentRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateContributoryFactorsCommentController(csipApiService)

  const validate = (req: Request, res: Response, next: NextFunction) => {
    return validateSchema(schemaFactory(res, controller.getSelectedCf(req)!))(req, res, next)
  }

  get('/', controller.GET)
  post('/', validate, controller.checkSubmitToAPI, controller.POST)

  return router
}
