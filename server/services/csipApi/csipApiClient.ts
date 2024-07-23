import RestClient from '../../data/restClient'
import config from '../../config'
import { CsipRecord, ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'

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
}
