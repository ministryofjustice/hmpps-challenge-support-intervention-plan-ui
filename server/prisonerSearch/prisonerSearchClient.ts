import RestClient from '../data/restClient'
import Prisoner from './prisoner'
import config from '../config'

export interface PrisonerSearchClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
}

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    const prisonerData = await this.restClient.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })
    return {
      ...prisonerData,
      bookingId: prisonerData.bookingId ? prisonerData.bookingId : undefined,
    }
  }
}
