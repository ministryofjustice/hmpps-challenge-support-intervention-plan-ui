import { Router } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'
import { RecordInvestigationController } from './controller'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { StaffInvolvedRoutes } from './staff-involved/routes'

function Routes(_csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  const controller = new RecordInvestigationController()

  router.get('/', asyncMiddleware(controller.GET))
  router.use('/staff-involved', StaffInvolvedRoutes())

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(csipApiService, prisonerSearchService))
  router.use('/record-investigation', Routes(csipApiService))

  return router
}
