import { dataAccess } from '../data'
import PrisonerSearchService from './prisonerSearch/prisonerSearchService'
import AuditService from './auditService'
import PrisonApiService from './prisonApi/prisonApiService'
import CsipApiService from './csipApi/csipApiService'

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

  return {
    applicationInfo,
    auditService,
    csipApiService,
    prisonerSearchService,
    prisonApiService,
    tokenStore,
    appInsightsClient,
  }
}

export type Services = ReturnType<typeof services>
