import { UsualBehaviourPresentationController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'

export const UsualBehaviourPresentationRoutes = (suggestedCaseNotesService: SuggestedCaseNotesService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UsualBehaviourPresentationController(suggestedCaseNotesService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
