import { dataAccess } from '../data'
import PrisonerSearchService from './prisonerSearch/prisonerSearchService'
import AuditService from './auditService'
import PrisonerImageService from './prisonerImage/prisonerImageService'
import CsipApiService from './csipApi/csipApiService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, prisonerSearchApiClient, prisonerImageClient, csipApiClient } =
    dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const csipApiService = new CsipApiService(csipApiClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClient)
  const prisonerImageService = new PrisonerImageService(prisonerImageClient)

  return {
    applicationInfo,
    auditService,
    csipApiService,
    prisonerSearchService,
    prisonerImageService,
  }
}

export type Services = ReturnType<typeof services>
