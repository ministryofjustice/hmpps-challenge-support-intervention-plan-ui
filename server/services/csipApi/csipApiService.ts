import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import {
  CsipOverview,
  CsipRecord,
  CsipSearchResults,
  CurrentCsipSummary,
  ReferenceData,
  ReferenceDataType,
} from '../../@types/csip/csipApiTypes'
import CsipApiClient, { ServiceConfigInfo } from './csipApiClient'
import { components } from '../../@types/csip'

export default class CsipApiService {
  constructor(private readonly csipApiClientBuilder: RestClientBuilder<CsipApiClient>) {}

  getReferenceData(req: Request, domain: ReferenceDataType): Promise<ReferenceData[]> {
    return this.csipApiClientBuilder(req.systemClientToken).getReferenceData(domain)
  }

  getCsipRecord(req: Request, id: string): Promise<CsipRecord> {
    return this.csipApiClientBuilder(req.systemClientToken).getCsipRecord(id)
  }

  searchAndSortCsipRecords(
    req: Request,
    payload: Parameters<CsipApiClient['searchAndSortCsipRecords']>[0],
  ): Promise<CsipSearchResults> {
    return this.csipApiClientBuilder(req.systemClientToken).searchAndSortCsipRecords(payload)
  }

  getCsipOverview(req: Request, prisonCode: string): Promise<CsipOverview> {
    return this.csipApiClientBuilder(req.systemClientToken).getCsipOverview(prisonCode)
  }

  getCurrentCsipRecord(req: Request, prisonerNumber: string): Promise<CurrentCsipSummary> {
    return this.csipApiClientBuilder(req.systemClientToken).getCurrentCsipRecord(prisonerNumber)
  }

  getServiceConfigInfo(req: Request): Promise<ServiceConfigInfo> {
    return this.csipApiClientBuilder(req.systemClientToken).getServiceConfigInfo()
  }

  createReferral(
    req: Request,
    createCsipRecordRequest: components['schemas']['CreateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.csipApiClientBuilder(req.systemClientToken).createReferral(
      req.journeyData.prisoner!.prisonerNumber,
      createCsipRecordRequest,
    )
  }

  async mergeReferral(
    req: Request,
    mergeReferralRequest: components['schemas']['MergeReferralRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.csipApiClientBuilder(req.systemClientToken).mergeReferral(
      req.journeyData.csipRecord!.recordUuid,
      mergeReferralRequest,
    )
  }

  updateCsipRecord(
    req: Request,
    updateCsipRecordRequest: components['schemas']['UpdateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.csipApiClientBuilder(req.systemClientToken).updateCsipRecord(
      req.journeyData.csipRecord!.recordUuid,
      updateCsipRecordRequest,
    )
  }

  addContributoryFactor(
    req: Request,
    createContributoryFactorRequest: components['schemas']['CreateContributoryFactorRequest'],
  ): Promise<components['schemas']['ContributoryFactor']> {
    return this.csipApiClientBuilder(req.systemClientToken).addContributoryFactor(
      req.journeyData.csipRecord!.recordUuid,
      createContributoryFactorRequest,
    )
  }

  upsertScreeningOutcome(req: Request, payload: Parameters<CsipApiClient['upsertScreeningOutcome']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).upsertScreeningOutcome(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  createInvestigation(req: Request, payload: Parameters<CsipApiClient['createInvestigation']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createInvestigation(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  updateInvestigation(
    req: Request,
    updateInvestigationRequest: components['schemas']['UpdateInvestigationRequest'],
  ): Promise<components['schemas']['Investigation']> {
    return this.csipApiClientBuilder(req.systemClientToken).updateInvestigation(
      req.journeyData.csipRecord!.recordUuid,
      updateInvestigationRequest,
    )
  }

  addInterview(
    req: Request,
    createInterviewRequest: components['schemas']['CreateInterviewRequest'],
  ): Promise<components['schemas']['Interview']> {
    return this.csipApiClientBuilder(req.systemClientToken).addInterview(
      req.journeyData.csipRecord!.recordUuid,
      createInterviewRequest,
    )
  }

  updateInterview(
    req: Request,
    interviewUuid: string,
    updateInterviewRequest: components['schemas']['UpdateInterviewRequest'],
  ): Promise<components['schemas']['Interview']> {
    return this.csipApiClientBuilder(req.systemClientToken).updateInterview(interviewUuid, updateInterviewRequest)
  }

  upsertDecision(req: Request, payload: Parameters<CsipApiClient['upsertDecision']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).upsertDecision(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  createPlan(req: Request, payload: Parameters<CsipApiClient['createPlan']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createPlan(req.journeyData.csipRecord!.recordUuid, payload)
  }

  updatePlan(req: Request, payload: components['schemas']['UpdatePlanRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).updatePlan(req.journeyData.csipRecord!.recordUuid, payload)
  }

  addIdentifiedNeed(req: Request, payload: components['schemas']['CreateIdentifiedNeedRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).createIdentifiedNeed(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  updateIdentifiedNeed(
    req: Request,
    identifiedNeedUuid: string,
    payload: components['schemas']['UpdateIdentifiedNeedRequest'],
  ) {
    return this.csipApiClientBuilder(req.systemClientToken).updateIdentifiedNeed(identifiedNeedUuid, payload)
  }

  updateContributoryFactor(
    req: Request,
    factorUuid: string,
    payload: Parameters<CsipApiClient['updateContributoryFactor']>[1],
  ) {
    return this.csipApiClientBuilder(req.systemClientToken).updateContributoryFactor(factorUuid, payload)
  }

  createReview(req: Request, payload: components['schemas']['CreateReviewRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).createReview(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  updateReview(req: Request, payload: components['schemas']['UpdateReviewRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).updateReview(req.journeyData.review!.reviewUuid!, payload)
  }

  updateAttendee(req: Request, attendeeUuid: string, payload: components['schemas']['UpdateAttendeeRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).updateAttendee(attendeeUuid, payload)
  }

  addNewAttendee(req: Request, payload: components['schemas']['CreateAttendeeRequest']) {
    return this.csipApiClientBuilder(req.systemClientToken).addNewAttendee(req.journeyData.review!.reviewUuid!, payload)
  }
}
