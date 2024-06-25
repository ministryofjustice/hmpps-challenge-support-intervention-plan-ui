import { Request, Response } from 'express'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { PrisonerSummary } from '../../@types/express'

export class StartJourneyController {
  constructor(private readonly prisonerSearchService: PrisonerSearchService) {}

  redirectWithPrisonerData =
    (url: string) =>
    async (req: Request, res: Response): Promise<void> => {
      const { journeyId, prisonerNumber } = req.params
      const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, prisonerNumber as string)
      req.journeyData.prisoner = prisoner as PrisonerSummary
      res.redirect(`/${journeyId}${url}`)
    }
}
