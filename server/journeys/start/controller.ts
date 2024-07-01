import { Request, Response } from 'express'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { PrisonerSummary } from '../../@types/express'
import { SanitisedError } from '../../sanitisedError'

export class StartJourneyController {
  constructor(private readonly prisonerSearchService: PrisonerSearchService) {}

  redirectWithPrisonerData =
    (url: string) =>
    async (req: Request, res: Response): Promise<void> => {
      const { journeyId, prisonerNumber } = req.params
      const prisoner = await this.prisonerSearchService
        .getPrisonerDetails(req, prisonerNumber as string)
        .catch((error: unknown) => {
          if (!(error instanceof Error)) {
            throw error
          }
          const sanitisedError = error as SanitisedError
          if (sanitisedError.status === 404) {
            res.redirect(`${res.locals.digitalPrisonServicesUrl}/prisoner-search`)
            return
          }
          throw error
        })
      req.journeyData.prisoner = prisoner as PrisonerSummary
      req.journeyData.referral = {}
      res.redirect(`/${journeyId}${url}`)
    }
}
