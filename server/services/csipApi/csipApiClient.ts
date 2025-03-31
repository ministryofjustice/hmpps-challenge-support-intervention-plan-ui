import RestClient from '../../data/restClient'
import config from '../../config'
import {
  CsipOverview,
  CsipRecord,
  CsipRecordStatus,
  CsipSearchResults,
  CurrentCsipSummary,
  ReferenceData,
  ReferenceDataType,
} from '../../@types/csip/csipApiTypes'
import { components } from '../../@types/csip'

export interface ServiceConfigInfo {
  git: {
    branch: string
    commit: {
      id: string
      time: string
    }
  }
  build: {
    operatingSystem: string
    version: string
    artifact: string
    machine: string
    by: string
    name: string
    time: string
    group: string
  }
  activeAgencies: string[]
  publishEvents: boolean
  productId: string
}
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

  async searchAndSortCsipRecords({
    prisonCode,
    query,
    status,
    sort,
    page,
    size,
  }: {
    prisonCode: string
    query?: string
    status?: CsipRecordStatus[] | null
    sort: string
    page: number
    size: number
  }): Promise<CsipSearchResults> {
    return this.restClient.get<CsipSearchResults>({
      path: `/search/csip-records?page=${page}&size=${size}&prisonCode=${prisonCode}&query=${encodeURIComponent(query ?? '')}&status=${status ?? ''}&sort=${sort}`,
    })
  }

  async getCsipOverview(prisonCode: string): Promise<CsipOverview> {
    return this.restClient.get<CsipOverview>({
      path: `/prisons/${prisonCode}/csip-records/overview`,
    })
  }

  async getCurrentCsipRecord(prisonerNumber: string): Promise<CurrentCsipSummary> {
    return this.restClient.get<CurrentCsipSummary>({
      path: `/prisoners/${prisonerNumber}/csip-records/current`,
    })
  }

  async getServiceConfigInfo(): Promise<ServiceConfigInfo> {
    return this.restClient.get<ServiceConfigInfo>({
      path: `/info`,
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

  async mergeReferral(
    recordUuid: string,
    mergeReferralRequest: components['schemas']['MergeReferralRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.restClient.put<components['schemas']['CsipRecord']>({
      path: `/csip-records/${recordUuid}/referral`,
      data: mergeReferralRequest,
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

  async addContributoryFactor(
    recordUuid: string,
    createContributoryFactorRequest: components['schemas']['CreateContributoryFactorRequest'],
  ): Promise<components['schemas']['ContributoryFactor']> {
    return this.restClient.post({
      path: `/csip-records/${recordUuid}/referral/contributory-factors`,
      data: createContributoryFactorRequest,
    })
  }

  async upsertScreeningOutcome(
    recordUuid: string,
    payload: components['schemas']['UpsertSaferCustodyScreeningOutcomeRequest'],
  ) {
    return this.restClient.put<components['schemas']['UpsertSaferCustodyScreeningOutcomeRequest']>({
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

  async updateInvestigation(
    recordUuid: string,
    updateInvestigationRequest: components['schemas']['UpdateInvestigationRequest'],
  ): Promise<components['schemas']['Investigation']> {
    return this.restClient.patch<components['schemas']['Investigation']>({
      path: `/csip-records/${recordUuid}/referral/investigation`,
      data: updateInvestigationRequest,
    })
  }

  async addInterview(
    recordUuid: string,
    createInterviewRequest: components['schemas']['CreateInterviewRequest'],
  ): Promise<components['schemas']['Interview']> {
    return this.restClient.post({
      path: `/csip-records/${recordUuid}/referral/investigation/interviews`,
      data: createInterviewRequest,
    })
  }

  async updateInterview(
    interviewUuid: string,
    updateInterviewRequest: components['schemas']['UpdateInterviewRequest'],
  ): Promise<components['schemas']['Interview']> {
    return this.restClient.patch({
      path: `/csip-records/referral/investigation/interviews/${interviewUuid}`,
      data: updateInterviewRequest,
    })
  }

  async upsertDecision(recordUuid: string, payload: components['schemas']['UpsertDecisionAndActionsRequest']) {
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

  async updatePlan(recordUuid: string, payload: components['schemas']['UpdatePlanRequest']) {
    return this.restClient.patch<components['schemas']['Plan']>({
      path: `/csip-records/${recordUuid}/plan`,
      data: payload,
    })
  }

  async createIdentifiedNeed(recordUuid: string, payload: components['schemas']['CreateIdentifiedNeedRequest']) {
    return this.restClient.post<components['schemas']['IdentifiedNeed']>({
      path: `/csip-records/${recordUuid}/plan/identified-needs`,
      data: payload,
    })
  }

  async updateIdentifiedNeed(
    identifiedNeedUuid: string,
    payload: components['schemas']['UpdateIdentifiedNeedRequest'],
  ) {
    return this.restClient.patch<components['schemas']['IdentifiedNeed']>({
      path: `/csip-records/plan/identified-needs/${identifiedNeedUuid}`,
      data: payload,
    })
  }

  async updateContributoryFactor(
    factorUuid: string,
    payload: components['schemas']['UpdateContributoryFactorRequest'],
  ) {
    return this.restClient.patch<components['schemas']['ContributoryFactor']>({
      path: `/csip-records/referral/contributory-factors/${factorUuid}`,
      data: payload,
    })
  }

  async createReview(recordUuid: string, payload: components['schemas']['CreateReviewRequest']) {
    return this.restClient.post<components['schemas']['Review']>({
      path: `/csip-records/${recordUuid}/plan/reviews`,
      data: payload,
    })
  }

  async updateReview(reviewUuid: string, payload: components['schemas']['UpdateReviewRequest']) {
    return this.restClient.patch<components['schemas']['Review']>({
      path: `/csip-records/plan/reviews/${reviewUuid}`,
      data: payload,
    })
  }

  async updateAttendee(attendeeUuid: string, payload: components['schemas']['UpdateAttendeeRequest']) {
    return this.restClient.patch<components['schemas']['Attendee']>({
      path: `/csip-records/plan/reviews/attendees/${attendeeUuid}`,
      data: payload,
    })
  }

  async addNewAttendee(reviewUuid: string, payload: components['schemas']['CreateAttendeeRequest']) {
    return this.restClient.post<components['schemas']['Attendee']>({
      path: `/csip-records/plan/reviews/${reviewUuid}/attendees`,
      data: payload,
    })
  }
}
