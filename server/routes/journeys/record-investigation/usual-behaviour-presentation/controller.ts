import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import type { SuggestedCaseNotesResponse } from '../../../../services/suggestedCaseNotes/types'
import { loadSuggestedCaseNotesWidget } from '../suggestedCaseNotesWidget'
import previewResponse from '../../../../services/suggestedCaseNotes/fixtures/csip-assist-response.json'

const localPreviewPrisonerNumber = 'G0301GL'
const typedPreviewResponse = previewResponse as SuggestedCaseNotesResponse

export class UsualBehaviourPresentationController {
  constructor(private readonly suggestedCaseNotesService: SuggestedCaseNotesService) {}

  GET = async (req: Request, res: Response) => {
    const personsUsualBehaviour =
      res.locals.formResponses?.['personsUsualBehaviour'] ?? req.journeyData.investigation?.personsUsualBehaviour
    const isLocalWidgetPreview =
      process.env.NODE_ENV === 'development' && req.journeyData.csipRecord?.recordUuid === 'local-dev-record'
    const widgetRequest = isLocalWidgetPreview
      ? Object.assign(Object.create(req), {
          journeyData: {
            ...req.journeyData,
            prisoner: {
              ...req.journeyData.prisoner,
              prisonerNumber: localPreviewPrisonerNumber,
            },
          },
        })
      : req
    const { showSuggestedCaseNotesWidget, suggestedCaseNotesWidget } = await loadSuggestedCaseNotesWidget({
      req: widgetRequest,
      res,
      suggestedCaseNotesService: this.suggestedCaseNotesService,
      behaviourType: 'usual_behaviour_presentation',
      pageName: 'usual behaviour presentation',
      forceShow: isLocalWidgetPreview,
      ...(isLocalWidgetPreview ? { previewResponse: typedPreviewResponse } : {}),
    })

    res.render('record-investigation/usual-behaviour-presentation/view', {
      personsUsualBehaviour,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.personsUsualBehaviour = req.body.personsUsualBehaviour
    res.redirect('../record-investigation')
  }
}
