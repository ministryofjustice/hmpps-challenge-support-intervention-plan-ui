import { Router } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'
import { RecordInvestigationController } from './controller'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { StaffInvolvedRoutes } from './staff-involved/routes'
import { OccurrenceReasonRoutes } from './why-behaviour-occurred/routes'
import { EvidenceSecuredRoutes } from './evidence-secured/routes'
import { UsualBehaviourPresentationRoutes } from './usual-behaviour-presentation/routes'
import { TriggersRoutes } from './triggers/routes'
import { ProtectiveFactorsRoutes } from './protective-factors/routes'

function Routes(_csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  const controller = new RecordInvestigationController()

  router.get('/', asyncMiddleware(controller.GET))
  router.use('/staff-involved', StaffInvolvedRoutes())
  router.use('/why-behaviour-occurred', OccurrenceReasonRoutes())
  router.use('/evidence-secured', EvidenceSecuredRoutes())
  router.use('/usual-behaviour-presentation', UsualBehaviourPresentationRoutes())
  router.use('/triggers', TriggersRoutes())
  router.use('/protective-factors', ProtectiveFactorsRoutes())

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(csipApiService, prisonerSearchService))
  router.use('/record-investigation', Routes(csipApiService))

  return router
}
