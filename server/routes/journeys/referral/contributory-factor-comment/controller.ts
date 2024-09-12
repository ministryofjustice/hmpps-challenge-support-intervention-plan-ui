import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SchemaType } from './schemas'
import { ContributoryFactor } from '../../../../@types/express'

const findFactor = (req: Request) => {
  const { factorUuid, factorTypeCode } = req.params // One of these will be undefined depending on if we're editing or not
  const contributoryFactors = factorUuid
    ? req.journeyData.csipRecord!.referral.contributoryFactors
    : req.journeyData.referral!.contributoryFactors
  const findFunction = req.journeyData.isUpdate
    ? (itm: ContributoryFactor) => itm.factorUuid === factorUuid
    : (itm: ContributoryFactor) => itm.factorType.code.toLowerCase() === factorTypeCode
  return contributoryFactors!.find(findFunction)!
}

export class ReferralContributoryFactorCommentController {
  GET = async (req: Request, res: Response) => {
    const factor = findFactor(req)
    res.render('referral/contributory-factor-comment/view', {
      factorDescription: factor.factorType.description,
      comment: res.locals.formResponses?.['comment'] || factor.comment,
      backUrl: 'contributory-factors-comments',
    })
  }

  POST = async (req: Request<ParamsDictionary, unknown, SchemaType>, res: Response) => {
    const factor = findFactor(req)
    if (req.body.comment) {
      factor.comment = req.body.comment
    } else {
      delete factor.comment
    }
    res.redirect('contributory-factors-comments')
  }
}
