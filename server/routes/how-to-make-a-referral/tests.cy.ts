import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('test /how-to-make-a-referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('tests page', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/how-to-make-a-referral$/)
    cy.findByRole('link', { name: /main DPS prisoner search/i })
      .should('be.visible')
      .should('have.attr', 'href', 'http://localhost:9091/dpshomepage/prisoner-search')
    checkAxeAccessibility()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`how-to-make-a-referral`)
  }
})
