Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/how-to-make-a-referral')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})
