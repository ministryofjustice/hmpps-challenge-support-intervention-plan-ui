import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { CsipRecord, CsipSummaries, ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
import CsipApiClient from './csipApiClient'
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

  createDecision(req: Request, payload: Parameters<CsipApiClient['createDecision']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createDecision(
      req.journeyData.csipRecord!.recordUuid,
      payload,
    )
  }

  createPlan(req: Request, payload: Parameters<CsipApiClient['createPlan']>[1]) {
    return this.csipApiClientBuilder(req.systemClientToken).createPlan(req.journeyData.csipRecord!.recordUuid, payload)
  }
}
