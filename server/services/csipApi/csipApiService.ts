import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { CsipRecord, ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
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

  createReferral(
    req: Request,
    createCsipRecordRequest: components['schemas']['CreateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.csipApiClientBuilder(req.systemClientToken).createReferral(
      req.journeyData.prisoner!.prisonerNumber,
      createCsipRecordRequest,
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
}
