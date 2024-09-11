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

  async getCsipRecord(recordUuid: string): Promise<CsipRecord> {
    return this.restClient.get<CsipRecord>({ path: `/csip-records/${recordUuid}` })
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

  async updateCsipRecord(
    recordUuid: string,
    updateCsipRecordRequest: components['schemas']['UpdateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.restClient.patch<components['schemas']['CsipRecord']>({
      path: `/csip-records/${recordUuid}`,
      data: updateCsipRecordRequest,
    })
  }

  async createScreeningOutcome(
    recordUuid: string,
    payload: components['schemas']['CreateSaferCustodyScreeningOutcomeRequest'],
  ) {
    return this.restClient.post<components['schemas']['SaferCustodyScreeningOutcome']>({
      path: `/csip-records/${recordUuid}/referral/safer-custody-screening`,
      data: payload,
    })
  }

  async createInvestigation(recordUuid: string, payload: components['schemas']['CreateInvestigationRequest']) {
    return this.restClient.post<components['schemas']['Investigation']>({
      path: `/csip-records/${recordUuid}/referral/investigation`,
      data: payload,
    })
  }

  async createDecision(recordUuid: string, payload: components['schemas']['UpsertDecisionAndActionsRequest']) {
    return this.restClient.put<components['schemas']['DecisionAndActions']>({
      path: `/csip-records/${recordUuid}/referral/decision-and-actions`,
      data: payload,
    })
  }

  async createPlan(recordUuid: string, payload: components['schemas']['CreatePlanRequest']) {
    return this.restClient.post<components['schemas']['Plan']>({
      path: `/csip-records/${recordUuid}/plan`,
      data: payload,
    })
  }
}
