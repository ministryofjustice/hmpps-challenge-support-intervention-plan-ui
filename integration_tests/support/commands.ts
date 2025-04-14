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

Cypress.Commands.add(
  'pageCheckCharacterThresholdMessage',
  (element: Cypress.Chainable<JQuery<HTMLElement>>, maxChars: number, threshold = 0.75) => {
    const charsAtThreshold = maxChars * threshold
    const charsLeft = maxChars - charsAtThreshold

    element.clear().type('a'.repeat(charsAtThreshold), {
      delay: 0,
      force: true,
    })
    cy.contains(new RegExp(`you have ${charsLeft} characters remaining`, 'i')).should('be.visible')
    element.type('a', { delay: 0 })
    cy.contains(new RegExp(`you have ${charsLeft - 1} characters remaining`, 'i')).should('be.visible')
    element.type('a'.repeat(charsLeft - 1), {
      delay: 0,
      force: true,
    })
    cy.contains(/you have 0 characters remaining/i).should('be.visible')
    element.clear()
  },
)
