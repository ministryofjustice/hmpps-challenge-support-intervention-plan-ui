import { JourneyData } from '../../server/@types/express'

export const injectJourneyDataAndReload = (uuid: string, json: Partial<JourneyData>) => {
  const data = encodeURIComponent(btoa(JSON.stringify(json)))
  cy.request('GET', `/${uuid}/inject-journey-data?data=${data}`)
  cy.reload()
}
