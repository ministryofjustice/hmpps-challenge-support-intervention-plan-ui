import RestClient from '../../data/restClient'
import config from '../../config'
import { CsipRecord, ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
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

  async getCsipRecord(id: string): Promise<CsipRecord> {
    return this.restClient.get<CsipRecord>({ path: `/csip-records/${id}` })
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

  async createScreeningOutcome(
    csipRecordId: string,
    createScreeningOutcomeRequest: components['schemas']['CreateSaferCustodyScreeningOutcomeRequest'],
  ) {
    return this.restClient.post<components['schemas']['SaferCustodyScreeningOutcome']>({
      path: `/csip-records/${csipRecordId}/referral/safer-custody-screening`,
      data: createScreeningOutcomeRequest,
    })
  }
}
