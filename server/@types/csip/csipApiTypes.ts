import { components, operations } from './index'

export type ReferenceData = components['schemas']['ReferenceData']
export type ReferenceDataType = operations['getReferenceData']['parameters']['path']['domain']

// TODO: to be replaced with Enum from CSIP API
export type YesNoAnswer = 'yes' | 'no' | 'do_not_know'
