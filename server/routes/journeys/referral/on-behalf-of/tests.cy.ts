import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
  })

  it('test involvement, including all edge cases', () => {
    setupDataSignInAndGo()

    cy.findByRole('heading', { name: /make a csip referral/i }).should('be.visible')
    cy.findByText(/are you making this referral on someone else’s behalf\?/i).should('be.visible')

    checkAxeAccessibility()

    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /select if you’re making this referral on someone else’s behalf or not/i }).should(
      'be.visible',
    )

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')

    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /no/i }).should('be.checked')
  })

  const setupDataSignInAndGo = () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')
    cy.url().should('include', 'on-behalf-of')
  }
})
