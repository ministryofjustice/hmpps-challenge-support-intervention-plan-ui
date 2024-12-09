import { Request, Response } from 'express'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../../../services/prisonerSearch/prisonerSearchService'
import { SanitisedError } from '../../../../sanitisedError'

export class ContinueJourneyController {
  constructor(
    private readonly csipService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  redirectWithCsipData = (url: string) => async (req: Request, res: Response) => {
    const { csipRecordId, journeyId } = req.params
    try {
      const csip = await this.csipService.getCsipRecord(req, csipRecordId as string)
      req.journeyData.csipRecord = csip
      req.journeyData.referral = csip.referral
      req.journeyData.referral.continuingReferral = true
      req.journeyData.referral.isOnBehalfOfReferral =
        req.journeyData.referral?.referredBy === res.locals.user.displayName
      req.journeyData.prisoner = await this.prisonerSearchService.getPrisonerDetails(req, csip.prisonNumber as string)
      return res.redirect(`/${journeyId}${url}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        const sanitisedError = error as SanitisedError
        if (sanitisedError.status === 404) {
          return res.redirect('/')
        }
      }

      throw error
    }
  }
}
