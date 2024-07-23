import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
import CsipApiClient from './csipApiClient'
import { components } from '../../@types/csip'

export default class CsipApiService {
  constructor(private readonly csipApiClientBuilder: RestClientBuilder<CsipApiClient>) {}

  getReferenceData(req: Request, domain: ReferenceDataType): Promise<ReferenceData[]> {
    return this.csipApiClientBuilder(req.systemClientToken).getReferenceData(domain)
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
}
