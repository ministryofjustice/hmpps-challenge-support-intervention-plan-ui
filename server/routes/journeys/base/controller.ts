import { Request } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { ReferenceData, ReferenceDataType } from '../../../@types/csip/csipApiTypes'

export class BaseJourneyController {
  constructor(readonly csipApiService: CsipApiService) {}

  getReferenceDataOptionsForRadios = async (
    req: Request,
    domain: ReferenceDataType,
    value?: ReferenceData | string,
  ) => [
    ...(await this.csipApiService.getReferenceData(req, domain)).map(refData => ({
      value: refData.code,
      text: refData.description,
      checked: typeof value === 'string' ? refData.code === value : refData.code === value?.code,
    })),
  ]

  getReferenceDataOptionsForSelect = async (
    req: Request,
    domain: ReferenceDataType,
    label: string,
    value?: ReferenceData | string,
  ) => [
    {
      value: '',
      text: label,
      selected: !value,
    },
    ...(await this.csipApiService.getReferenceData(req, domain)).map(refData => ({
      value: refData.code,
      text: refData.description,
      selected: typeof value === 'string' ? refData.code === value : refData.code === value?.code,
    })),
  ]

  getReferenceDataOptionsForCheckboxes = async (req: Request, domain: ReferenceDataType, value?: string | string[]) =>
    (await this.csipApiService.getReferenceData(req, domain)).map(refData => ({
      value: refData.code,
      text: refData.description,
      checked: Array.isArray(value) ? value.includes(refData.code) : refData.code === value,
    }))
}
