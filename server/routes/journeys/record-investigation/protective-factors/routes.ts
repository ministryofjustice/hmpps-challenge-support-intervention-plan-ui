import { ProtectiveFactorsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'

export const ProtectiveFactorsRoutes = (suggestedCaseNotesService: SuggestedCaseNotesService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ProtectiveFactorsController(suggestedCaseNotesService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
