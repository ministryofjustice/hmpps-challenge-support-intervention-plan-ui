import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type { Services } from '../../services'
import { JourneyRouter } from '../journeys/base/routes'
import { PrisonerCsipsController } from './controller'

export const PrisonerCsipRoutes = ({ csipApiService, prisonerPermissionsService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new PrisonerCsipsController(csipApiService)

  const populatePrisonerDataMiddleware = prisonerPermissionsGuard(prisonerPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonNumber'] as string,
  })

  get('/:prisonNumber', populatePrisonerDataMiddleware, controller.GET)

  return router
}
