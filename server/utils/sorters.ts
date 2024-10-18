import { components } from '../@types/csip'

export const interviewSorter = (intA: components['schemas']['Interview'], intB: components['schemas']['Interview']) =>
  intA.interviewDate.localeCompare(intB.interviewDate) || // 1. sort by ascending date, if tie then
  Number(!intA.interviewText) - Number(!intB.interviewText) || // 2. sort nullish text to bottom, if tie then
  (intA.interviewText && intB.interviewText && intA.interviewText.localeCompare(intB.interviewText)) || // 3. sort by non-null text alphabetically, if tie then
  intA.interviewUuid.localeCompare(intB.interviewUuid) // 4. sort by UUID alphabetically

export const identifiedNeedSorter = (
  a: components['schemas']['IdentifiedNeed'],
  b: components['schemas']['IdentifiedNeed'],
) =>
  Number(!b.closedDate) - Number(!a.closedDate) || // 1. sort CLOSED identified need to bottom, if tie then
  a.createdDate.localeCompare(b.createdDate) || // 2. sort by ascending Create Date, if tie then
  a.identifiedNeed.localeCompare(b.identifiedNeed) || // 3. sort by title alphabetically, if tie then
  a.identifiedNeedUuid.localeCompare(b.identifiedNeedUuid) // 4. sort by UUID alphabetically

export const attendeeSorter = (a: components['schemas']['Attendee'], b: components['schemas']['Attendee']) =>
  Number(!a.name) - Number(!b.name) || // 1. sort nullish name to bottom, if tie then
  (a.name && b.name && a.name.localeCompare(b.name)) || // 2. sort by non-null name alphabetically, if tie then
  a.attendeeUuid.localeCompare(b.attendeeUuid) // 3. sort by UUID alphabetically
