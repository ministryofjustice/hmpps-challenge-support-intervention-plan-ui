import { components } from '../@types/csip'

export const interviewSorter = (intA: components['schemas']['Interview'], intB: components['schemas']['Interview']) =>
  intA.interviewDate.localeCompare(intB.interviewDate) || // 1. sort by ascending date, if tie then
  +!intA.interviewText + -+!intB.interviewText || // 2. sort nullish text to bottom, if tie then
  (intA.interviewText && intB.interviewText && intA.interviewText.localeCompare(intB.interviewText)) || // 3. sort by non-null text alphabetically, if tie then
  intA.interviewUuid.localeCompare(intB.interviewUuid) // 4. sort by UUID alphabetically
