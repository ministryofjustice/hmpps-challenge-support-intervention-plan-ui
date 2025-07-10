import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('test /accessibility-statement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('tests page', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/accessibility-statement$/)
    cy.findByRole('heading', { name: 'Accessibility statement' }).should('be.visible')
    checkAxeAccessibility()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`accessibility-statement`)
  }
})
