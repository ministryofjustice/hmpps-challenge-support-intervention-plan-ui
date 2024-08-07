import { Router } from 'express'
import { ProtectiveFactorsController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ProtectiveFactorsRoutes = (): Router => {
  const { router, get, post } = JourneyRouter()
  const controller = new ProtectiveFactorsController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
