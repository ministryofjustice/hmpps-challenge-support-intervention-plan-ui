import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { dataAccess } from '../data'
import PrisonerSearchService from './prisonerSearch/prisonerSearchService'
import AuditService from './auditService'
import PrisonApiService from './prisonApi/prisonApiService'
import CsipApiService from './csipApi/csipApiService'
import config from '../config'
import logger from '../../logger'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    prisonerSearchApiClient,
    prisonerImageClient,
    csipApiClient,
    tokenStore,
    appInsightsClient,
  } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const csipApiService = new CsipApiService(csipApiClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClient)
  const prisonApiService = new PrisonApiService(prisonerImageClient)
  const prisonerPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore),
    logger,
    telemetryClient: appInsightsClient!,
  })

  return {
    applicationInfo,
    auditService,
    csipApiService,
    prisonerSearchService,
    prisonApiService,
    tokenStore,
    appInsightsClient,
    prisonerPermissionsService,
  }
}

export type Services = ReturnType<typeof services>
