import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-review/outcome', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getOutcomeClose = () => cy.findByRole('radio', { name: 'Close the CSIP' })
  const getOutcomeRemain = () =>
    cy.findByRole('radio', { name: 'What’s the outcome of this review? Keep the prisoner on the plan' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should redirect to close csip if CLOSE_CSIP is submitted', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/outcome#outcome$/)
    checkAxeAccessibility()

    validatePageContents()

    getOutcomeClose().click()
    getContinueButton().click()
    cy.url().should('to.match', /\/close-csip#outcome$/)

    cy.go('back')
    cy.reload()
    getOutcomeClose().should('be.checked')
  })

  it('should show success message if REMAIN_ON_CSIP is submitted', () => {
    navigateToTestPage()
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the review details for the most recent review.').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/reviews`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/reviews$/)
    cy.findByRole('link', { name: /update review/i }).click()
    cy.findByRole('link', { name: /Change the review outcome/i }).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'What’s the outcome of this review? - Record a CSIP review - DPS')
    cy.findByText('Update a CSIP review').should('be.visible')

    getOutcomeRemain().should('be.checked')
    getOutcomeClose().should('not.be.checked')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/update-review$/)

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }
})
