import StartJourneyRoutes from './start/routes'
import { RecordInvestigationController } from './controller'
import { StaffInvolvedRoutes } from './staff-involved/routes'
import { OccurrenceReasonRoutes } from './why-behaviour-occurred/routes'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { EvidenceSecuredRoutes } from './evidence-secured/routes'
import { UsualBehaviourPresentationRoutes } from './usual-behaviour-presentation/routes'

function Routes(_services: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordInvestigationController()

  get('/', controller.GET)
  router.use('/staff-involved', StaffInvolvedRoutes())
  router.use('/why-behaviour-occurred', OccurrenceReasonRoutes())
  router.use('/evidence-secured', EvidenceSecuredRoutes())
  router.use('/usual-behaviour-presentation', UsualBehaviourPresentationRoutes())

  return router
}

export default function routes({ services, path }: { services: Services; path: string }) {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-investigation/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
