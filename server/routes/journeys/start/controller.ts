import { Request, Response } from 'express'
import PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { PrisonerSummary } from '../../../@types/express'
import { SanitisedError } from '../../../sanitisedError'
import CsipApiService from '../../../services/csipApi/csipApiService'

export class StartJourneyController {
  constructor(
    private readonly csipService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  redirectWithPrisonerData = (url: string) => async (req: Request, res: Response) => {
    const { journeyId, prisonerNumber } = req.params
    try {
      const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, prisonerNumber as string)
      req.journeyData.prisoner = prisoner as PrisonerSummary
      req.journeyData.referral = {}
      req.journeyData.saferCustodyScreening = {}
      res.redirect(`/${journeyId}${url}`)
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error
      }
      const sanitisedError = error as SanitisedError
      if (sanitisedError.status === 404) {
        res.redirect(`${res.locals.digitalPrisonServicesUrl}/prisoner-search`)
        return
      }
      throw error
    }
  }

  redirectWithCsipData = (url: string) => async (req: Request, res: Response) => {
    const { csipRecordId, journeyId } = req.params

    try {
      delete req.journeyData.csipRecord
      const csip = await this.csipService.getCsipRecord(req, csipRecordId as string)
      req.journeyData.csipRecord = csip
      req.journeyData.saferCustodyScreening = {}
      req.journeyData.investigation = {}
      req.journeyData.decisionAndActions = {}
      req.journeyData.plan = {}
      req.journeyData.review = {}
      req.journeyData.prisoner = await this.prisonerSearchService.getPrisonerDetails(req, csip.prisonNumber as string)

      return res.redirect(`/${journeyId}${url}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        const sanitisedError = error as SanitisedError
        if (sanitisedError.status === 404) {
          if (!req.journeyData.csipRecord) {
            return res.redirect('/')
          }
          return res.redirect(`/csip-records/${csipRecordId}`)
        }
      }

      throw error
    }
  }
}
