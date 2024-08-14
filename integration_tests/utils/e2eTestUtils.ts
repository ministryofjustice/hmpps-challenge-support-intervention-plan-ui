export const injectJourneyDataAndReload = (uuid: string, json: object) => {
  const data = encodeURIComponent(btoa(JSON.stringify(json)))
  cy.request('GET', `/${uuid}/inject-journey-data?data=${data}`)
  cy.reload()
}
