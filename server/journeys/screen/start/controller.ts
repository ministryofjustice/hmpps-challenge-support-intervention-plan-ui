import { Request, Response } from 'express'
import { SanitisedError } from '../../../sanitisedError'
import CsipApiService from '../../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'

export class StartJourneyController {
  constructor(
    private readonly csipService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  redirectWithCsipData =
    (url: string) =>
    async (req: Request, res: Response): Promise<void> => {
      const { csipRecordId, journeyId } = req.params

      try {
        const csip = await this.csipService.getCsipRecord(req, csipRecordId as string)
        req.journeyData.csipRecord = csip
        req.journeyData.saferCustodyScreening = {}

        const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, csip.prisonNumber as string)
        req.journeyData.prisoner = prisoner

        return res.redirect(`/${journeyId}${url}`)
      } catch (error: unknown) {
        if (error instanceof Error) {
          const sanitisedError = error as SanitisedError
          if (sanitisedError.status === 404) {
            if (!req.journeyData.csipRecord) {
              return res.redirect('/')
            }
            return res.redirect(`/csip-record/${csipRecordId}`)
          }
        }

        throw error
      }
    }
}
