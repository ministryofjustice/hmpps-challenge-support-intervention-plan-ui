import { dataAccess } from '../data'
import PrisonerSearchService from '../prisonerSearch/prisonerSearchService'
import AuditService from './auditService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, prisonerSearchApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClient)

  return {
    applicationInfo,
    auditService,
    prisonerSearchService,
  }
}

export type Services = ReturnType<typeof services>
