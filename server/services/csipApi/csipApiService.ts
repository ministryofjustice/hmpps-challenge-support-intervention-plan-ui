import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
import CsipApiClient from './csipApiClient'

export default class CsipApiService {
  constructor(private readonly csipApiClientBuilder: RestClientBuilder<CsipApiClient>) {}

  getReferenceData(req: Request, domain: ReferenceDataType): Promise<ReferenceData[]> {
    return this.csipApiClientBuilder(req.systemClientToken).getReferenceData(domain)
  }
}
