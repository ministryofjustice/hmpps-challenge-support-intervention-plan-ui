import { Request } from 'express'
import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import { PrisonerImageClient } from './prisonerImageClient'

export default class PrisonerImageService {
  constructor(private readonly prisonerImageClientBuilder: RestClientBuilder<PrisonerImageClient>) {}

  getImage(req: Request, prisonerNumber: string): Promise<Readable> {
    return this.prisonerImageClientBuilder(req.systemClientToken).getImage(prisonerNumber)
  }
}
