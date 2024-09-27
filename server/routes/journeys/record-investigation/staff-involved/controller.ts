import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class StaffInvolvedController {
  GET = async (req: Request, res: Response) => {
    const staffInvolved = res.locals.formResponses?.['staffInvolved'] ?? req.journeyData.investigation!.staffInvolved
    res.render('record-investigation/staff-involved/view', {
      staffInvolved,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      threshold: '75',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.staffInvolved = req.body.staffInvolved
    res.redirect('../record-investigation')
  }
}
