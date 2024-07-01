import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { StartJourneyController } from '../../start/controller'
import PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'

export default function StartJourneyRoutes(prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const controller = new StartJourneyController(prisonerSearchService)

  get('/prisoners/:prisonerNumber/referral/start', controller.redirectWithPrisonerData('/referral/on-behalf-of'))

  return router
}
