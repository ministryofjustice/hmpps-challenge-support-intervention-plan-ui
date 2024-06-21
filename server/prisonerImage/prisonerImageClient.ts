import { Readable } from 'stream'
import RestClient from '../data/restClient'
import config from '../config'

export interface PrisonerImageClient {
  getImage(prisonerNumber: string): Promise<Readable>
}

export default class PrisonerImageRestClient implements PrisonerImageClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
  }

  async getImage(prisonerNumber: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${prisonerNumber}/image/data`,
    })
  }
}
