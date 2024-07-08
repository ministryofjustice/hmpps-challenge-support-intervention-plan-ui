import type Prisoner from '../../services/prisonerSearch/prisoner'

export const TEST_PRISONER = {
  cellLocation: '',
  firstName: 'Test',
  lastName: 'Person',
  prisonerNumber: 'ABC123',
} as Prisoner

const tomorrowDate = new Date()
tomorrowDate.setDate(tomorrowDate.getDate() + 1)

const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const TOMORROW_GB_FORMAT = DATE_FORMAT_GB.format(tomorrowDate)
export const TOMORROW_ISO_FORMAT = tomorrowDate.toISOString().substring(0, 10)
