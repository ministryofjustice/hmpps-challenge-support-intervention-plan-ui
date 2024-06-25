import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { PrisonerSearchClient } from './prisonerSearchClient'
import Prisoner from './prisoner'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  getPrisonerDetails(req: Request, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClientBuilder(req.systemClientToken).getPrisonerDetails(prisonerNumber)
  }
}
