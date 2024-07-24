import { Request } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import { ReferenceData, ReferenceDataType } from '../../@types/csip/csipApiTypes'
import { components } from '../../@types/csip'
import { sortAscending } from '../../utils/utils'

export class BaseJourneyController {
  constructor(private readonly csipApiService: CsipApiService) {}

  createReferral = async (req: Request, createCsipRecordRequest: components['schemas']['CreateCsipRecordRequest']) =>
    this.csipApiService.createReferral(req, createCsipRecordRequest)

  getReferenceDataOptionsForRadios = async (
    req: Request,
    domain: ReferenceDataType,
    value?: ReferenceData | string,
  ) => [
    ...(await this.csipApiService.getReferenceData(req, domain))
      .map(refData => ({
        value: refData.code,
        text: refData.description,
        checked: typeof value === 'string' ? refData.code === value : refData.code === value?.code,
      }))
      .sort((a, b) => sortAscending(a.text, b.text)),
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
    ...(await this.csipApiService.getReferenceData(req, domain))
      .map(refData => ({
        value: refData.code,
        text: refData.description,
        selected: typeof value === 'string' ? refData.code === value : refData.code === value?.code,
      }))
      .sort((a, b) => sortAscending(a.text, b.text)),
  ]

  getReferenceDataOptionsForCheckboxes = async (req: Request, domain: ReferenceDataType, value?: string | string[]) =>
    (await this.csipApiService.getReferenceData(req, domain))
      .map(refData => ({
        value: refData.code,
        text: refData.description,
        checked: Array.isArray(value) ? value.includes(refData.code) : refData.code === value,
      }))
      .sort((a, b) => sortAscending(a.text, b.text))
}
