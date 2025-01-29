import { JourneyData } from '../../server/@types/express'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/how-to-make-a-referral')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})

Cypress.Commands.add('verifyJourneyData', (uuid: string, validator: (journeyData: JourneyData) => void) => {
  cy.request(`/${uuid}/get-journey-data`).then(res => validator(res.body))
})
