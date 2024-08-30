import RestClient from '../../data/restClient'
import config from '../../config'
import { CsipRecord, CsipSummaries, ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
import { components } from '../../@types/csip'

export default class CsipApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('CSIP API', config.apis.csipApi, token)
  }

  async getReferenceData(domain: ReferenceDataType): Promise<ReferenceData[]> {
    return this.restClient.get<ReferenceData[]>({
      path: `/reference-data/${domain}`,
    })
  }

  async getCsipRecord(id: string): Promise<CsipRecord> {
    return this.restClient.get<CsipRecord>({ path: `/csip-records/${id}` })
  }

  async getPrisonerCsipRecords(prisonNumber: string, page: number, size: number): Promise<CsipSummaries> {
    return this.restClient.get<CsipSummaries>({
      path: `/prisoners/${prisonNumber}/csip-records?page=${page}&size=${size}`,
    })
  }

  async createReferral(
    prisonNumber: string,
    createCsipRecordRequest: components['schemas']['CreateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.restClient.post<components['schemas']['CsipRecord']>({
      path: `/prisoners/${prisonNumber}/csip-records`,
      data: createCsipRecordRequest,
    })
  }

  async createScreeningOutcome(
    csipRecordId: string,
    payload: components['schemas']['CreateSaferCustodyScreeningOutcomeRequest'],
  ) {
    return this.restClient.post<components['schemas']['SaferCustodyScreeningOutcome']>({
      path: `/csip-records/${csipRecordId}/referral/safer-custody-screening`,
      data: payload,
    })
  }

  async createInvestigation(csipRecordId: string, payload: components['schemas']['CreateInvestigationRequest']) {
    return this.restClient.post<components['schemas']['Investigation']>({
      path: `/csip-records/${csipRecordId}/referral/investigation`,
      data: payload,
    })
  }

  async createDecision(csipRecordId: string, payload: components['schemas']['UpsertDecisionAndActionsRequest']) {
    return this.restClient.put<components['schemas']['DecisionAndActions']>({
      path: `/csip-records/${csipRecordId}/referral/decision-and-actions`,
      data: payload,
    })
  }

  async createPlan(csipRecordId: string, payload: components['schemas']['CreatePlanRequest']) {
    return this.restClient.post<components['schemas']['Plan']>({
      path: `/csip-records/${csipRecordId}/plan`,
      data: payload,
    })
  }
}
