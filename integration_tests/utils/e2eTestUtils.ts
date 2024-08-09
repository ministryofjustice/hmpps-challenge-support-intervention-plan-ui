export const injectJourneyData = (uuid: string, json: object) => {
  const data = btoa(JSON.stringify(json))
  cy.request('GET', `/${uuid}/inject-journey-data?data=${data}`)
  cy.reload()
}
