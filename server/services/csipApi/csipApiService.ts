import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import {
  CsipRecord,
  CsipSearchResults,
  CsipSummaries,
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

  getPrisonerCsipRecords(req: Request, prisonNumber: string, page: number, size: number): Promise<CsipSummaries> {
    return this.csipApiClientBuilder(req.systemClientToken).getPrisonerCsipRecords(prisonNumber, page, size)
  }

  searchAndSortCsipRecords(params: {
    req: Request
    prisonCode: string
    query?: string
    status?: CsipRecord['status']
    sort: string
    page: number
    size: number
  }): Promise<CsipSearchResults> {
    const { req, ...queries } = params
    return this.csipApiClientBuilder(req.systemClientToken).searchAndSortCsipRecords(queries)
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

  createScreeningOutcome(req: Request, payload: Parameters<CsipApiClient['createScreeningOutcome']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createScreeningOutcome(
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

  createDecision(req: Request, payload: Parameters<CsipApiClient['createDecision']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createDecision(
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
}
