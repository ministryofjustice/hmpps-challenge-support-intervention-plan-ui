import RestClient from '../../data/restClient'
import config from '../../config'
import { ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
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

  async createReferral(
    prisonNumber: string,
    createCsipRecordRequest: components['schemas']['CreateCsipRecordRequest'],
  ): Promise<components['schemas']['CsipRecord']> {
    return this.restClient.post<components['schemas']['CsipRecord']>({
      path: `/prisoners/${prisonNumber}/csip-records`,
      data: createCsipRecordRequest,
    })
  }
}
