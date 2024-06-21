import { dataAccess } from '../data'
import PrisonerSearchService from '../prisonerSearch/prisonerSearchService'
import AuditService from './auditService'
import PrisonerImageService from '../prisonerImage/prisonerImageService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, prisonerSearchApiClient, prisonerImageClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClient)
  const prisonerImageService = new PrisonerImageService(prisonerImageClient)

  return {
    applicationInfo,
    auditService,
    prisonerSearchService,
    prisonerImageService,
  }
}

export type Services = ReturnType<typeof services>
