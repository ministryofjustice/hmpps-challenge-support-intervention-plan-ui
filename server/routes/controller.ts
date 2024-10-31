import { Request, Response } from 'express'
import { BaseJourneyController } from './journeys/base/controller'

export class HomePageController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const prisonCode = res.locals.user.activeCaseLoadId!
    res.locals.breadcrumbs.popLastItem()
    const { counts } = await this.csipApiService.getCsipOverview(req, prisonCode)

    return res.render('view', {
      showBreadcrumbs: true,
      activeCaseLoadName: res.locals.user.caseloads?.find(caseLoad => caseLoad.caseLoadId === prisonCode)?.description,
      ...counts,
    })
  }
}
