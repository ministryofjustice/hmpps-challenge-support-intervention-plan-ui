import { Request, Response } from 'express'
import path from 'path'
import PrisonerImageService from '../services/prisonerImage/prisonerImageService'

const placeHolderImage = path.join(process.cwd(), '/assets/images/prisoner-profile-image.png')

export default class PrisonerImageRoutes {
  constructor(private readonly prisonerImageService: PrisonerImageService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params

    return this.prisonerImageService
      .getImage(req, prisonerNumber as string)
      .then(data => {
        res.set('Cache-control', 'private, max-age=86400')
        res.removeHeader('pragma')
        res.type('image/jpeg')
        data.pipe(res)
      })
      .catch(_error => {
        res.sendFile(placeHolderImage)
      })
  }
}
