import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-referral/new-contributory-factor-comment', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getComment = () => cy.findByRole('textbox', { name: 'Add a comment on factor1 factors (optional)' })

  const resetInputs = () => {
    getComment().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContributoryFactorPostSuccess')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/new-code1-comment$/)

    checkAxeAccessibility()
    validatePageContents()
    validateErrorMessagesTextInputTooLong()
    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the information on contributory factors.').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('button', { name: /Add another contributory factor/i }).click()
    cy.url().should('to.match', /\/update-referral\/add-contributory-factor$/)
    cy.findByRole('radio', { name: 'Factor1' }).click()
    cy.findByRole('button', { name: /Continue/ }).click()
  }

  const validatePageContents = () => {
    cy.findByText('Update a CSIP referral').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /add-contributory-factor$/)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getComment().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Comment must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getComment().should('be.focused')
    getComment().should('have.value', 'a'.repeat(4001))
  }

  const completeInputs = () => {
    resetInputs()

    getComment().type('textarea input', { delay: 0 })
  }
})
