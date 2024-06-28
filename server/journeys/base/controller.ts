import { Request } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import { ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'

export class BaseJourneyController {
  constructor(private readonly csipApiService: CsipApiService) {}

  getReferenceDataOptions = async (req: Request, domain: ReferenceDataType, label: string, value?: ReferenceData) => [
    {
      value: '',
      text: label,
      selected: !value,
    },
    ...(await this.csipApiService.getReferenceData(req, domain)).map(refData => ({
      value: refData.code,
      text: refData.description,
      selected: refData.code === value?.code,
    })),
  ]
}
