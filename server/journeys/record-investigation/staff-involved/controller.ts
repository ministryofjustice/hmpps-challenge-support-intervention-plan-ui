import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class StaffInvolvedController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const staffInvolved = res.locals.formResponses?.['staffInvolved'] || req.journeyData.investigation!.staffInvolved
    res.render('record-investigation/staff-involved/view', {
      staffInvolved,
      backUrl: '../record-investigation',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.investigation!.staffInvolved = req.body.staffInvolved
    res.redirect('../record-investigation')
  }
}
