import { NextFunction, Request, Response } from 'express'
import PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { SanitisedError } from '../../../sanitisedError'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { summarisePrisoner } from '../../../utils/utils'

export class StartJourneyController {
  constructor(
    private readonly csipService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  redirectWithPrisonerData = (url: string) => async (req: Request, res: Response) => {
    const { journeyId, prisonerNumber } = req.params
    try {
      const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, prisonerNumber as string)
      req.journeyData.prisoner = summarisePrisoner(prisoner)
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

  addCsipToJourneyData = async (req: Request, res: Response, next: NextFunction) => {
    const { csipRecordId } = req.params

    try {
      delete req.journeyData.csipRecord
      const csip = await this.csipService.getCsipRecord(req, csipRecordId as string)
      req.journeyData.csipRecord = csip
      req.journeyData.saferCustodyScreening = csip.referral.saferCustodyScreeningOutcome
        ? {
            outcomeType: csip.referral.saferCustodyScreeningOutcome.outcome,
            reasonForDecision: csip.referral.saferCustodyScreeningOutcome.reasonForDecision!,
          }
        : {}
      req.journeyData.investigation = {}
      req.journeyData.decisionAndActions = csip.referral.decisionAndActions || {}
      req.journeyData.plan = {}
      req.journeyData.review = {}

      req.journeyData.prisoner = summarisePrisoner(
        await this.prisonerSearchService.getPrisonerDetails(req, csip.prisonNumber as string),
      )

      return next()
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

  redirectWithCsipData = (url: string) => async (req: Request, res: Response) => {
    const { csipRecordId, journeyId } = req.params

    try {
      delete req.journeyData.csipRecord
      const csip = await this.csipService.getCsipRecord(req, csipRecordId as string)
      req.journeyData.csipRecord = csip
      req.journeyData.saferCustodyScreening = csip.referral.saferCustodyScreeningOutcome
        ? {
            outcomeType: csip.referral.saferCustodyScreeningOutcome.outcome,
            reasonForDecision: csip.referral.saferCustodyScreeningOutcome.reasonForDecision!,
          }
        : {}
      req.journeyData.investigation = {}
      req.journeyData.decisionAndActions = csip.referral.decisionAndActions || {}
      req.journeyData.plan = {}
      req.journeyData.review = {}

      req.journeyData.prisoner = summarisePrisoner(
        await this.prisonerSearchService.getPrisonerDetails(req, csip.prisonNumber as string),
      )

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
