import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-review/next-review-date', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getNextReviewDate = () =>
    cy.findByRole('textbox', { name: 'When will you next review the plan with Testname User?' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchReviewSuccess')
    navigateToTestPage()
    cy.url().should('to.match', /\/next-review-date#nextReviewDate$/)

    checkAxeAccessibility()
    validatePageContents()
    validateErrorMessage()

    proceedToNextScreen()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the next review date').should('be.visible')
  })

  it('should handle patch failure', () => {
    cy.task('stubPatchReviewFail')
    navigateToTestPage()
    cy.url().should('to.match', /\/next-review-date#nextReviewDate$/)

    proceedToNextScreen()

    cy.findByText('Simulated Error for E2E testing').should('be.visible')
    cy.url().should('to.match', /\/next-review-date#nextReviewDate$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/reviews`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/reviews$/)
    cy.findByRole('link', { name: /update review/i }).click()
    cy.findByRole('link', { name: /Change the next review date/i }).click()
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Set a date for the next CSIP review' }).should('be.visible')
    cy.findByText('Update a CSIP review').should('be.visible')
    cy.findByText('Help with setting a review date').should('be.visible').click()
    cy.findByText('Choose a review date that’s consistent with the targets and dates in Testname User’s plan.').should(
      'be.visible',
    )
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/update-review$/)

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    getNextReviewDate().should('be.visible').and('have.value', '15/04/2025')
  }

  const validateErrorMessage = () => {
    getNextReviewDate().clear()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter a date for the next review/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    cy.findAllByText('Enter a date for the next review').should('have.length', 2)

    getNextReviewDate().clear().type('27/13/2024', { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Next review date must be a real date/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    getNextReviewDate().should('have.value', '27/13/2024')

    getNextReviewDate().clear().type('01/01/2024', { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Next review date must be today or in the future/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    getNextReviewDate().should('have.value', '01/01/2024')
  }

  const proceedToNextScreen = () => {
    getNextReviewDate().clear().type('27/8/2077', { delay: 0 })
    getContinueButton().click()
  }
})
