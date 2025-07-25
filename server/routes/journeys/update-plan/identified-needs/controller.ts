import { Request, Response } from 'express'
import { PatchPlanController } from '../../base/patchPlanController'
import { identifiedNeedSorter } from '../../../../utils/sorters'
import { getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export class UpdateIdentifiedNeedsController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (record.status.code !== 'CSIP_OPEN' || !record.plan) {
      res.redirect(`/csip-records/${record.recordUuid}`)
      return
    }

    const plan = record.plan!
    req.journeyData.plan = {
      identifiedNeeds: plan.identifiedNeeds.sort(identifiedNeedSorter).map(need => ({
        identifiedNeed: need.identifiedNeed,
        responsiblePerson: need.responsiblePerson,
        createdDate: need.createdDate,
        targetDate: need.targetDate,
        intervention: need.intervention,
        closedDate: need.closedDate ?? null,
        progression: need.progression ?? null,
        identifiedNeedUuid: need.identifiedNeedUuid,
        canEditIntervention:
          getMaxCharsAndThresholdForAppend(res.locals.user.displayName, need.intervention).maxLengthChars > 0,
        canEditProgression:
          getMaxCharsAndThresholdForAppend(res.locals.user.displayName, need.progression).maxLengthChars > 0,
      })),
    }
    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    res.render('update-plan/identified-needs/view', {
      identifiedNeeds: req.journeyData!.plan!.identifiedNeeds,
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      secondaryButton,
      record,
      showBreadcrumbs: true,
    })
  }
}
