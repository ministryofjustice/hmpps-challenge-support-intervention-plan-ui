import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /how-to-make-a-referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('tests page', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/how-to-make-a-referral$/)
    checkAxeAccessibility()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`how-to-make-a-referral`)
  }
})
