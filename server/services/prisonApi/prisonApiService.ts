import { Request } from 'express'
import { Readable } from 'stream'
import { RestClientBuilder } from '../../data'
import { PrisonApiClient } from './prisonApiClient'

export default class PrisonApiService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getPrisonerImage(req: Request, prisonerNumber: string): Promise<Readable> {
    return this.prisonApiClientBuilder(req.systemClientToken).getPrisonerImage(prisonerNumber)
  }
}
