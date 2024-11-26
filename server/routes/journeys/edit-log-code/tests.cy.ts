import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /edit-log-code', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getLogCodeInput = () =>
    cy.findByRole('textbox', { name: 'Update the CSIP log code for your internal records (optional)' })

  const resetInputs = () => {
    getLogCodeInput().clear()
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
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(
      `02e5854f-f7b1-4c56-bec8-69e390eb8550/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/edit-log-code/start`,
      { failOnStatusCode: false },
    )

    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('should try out all cases', () => {
    cy.task('stubCsipRecordPatchSuccess')
    navigateToTestPage()
    cy.url().should('to.match', /\/edit-log-code$/)

    checkAxeAccessibility()
    validatePageContents()
    validateErrorMessagesTextInputTooLong()
    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve edited the CSIP log code.').should('be.visible')
  })

  it('should handle API errors', () => {
    cy.task('stubCsipRecordPatchFail')
    navigateToTestPage()
    completeInputs()
    getContinueButton().click()
    cy.url().should('to.match', /\/edit-log-code$/)

    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findByRole('link', { name: /Edit log code/i }).click()
  }

  const validatePageContents = () => {
    cy.findByText('Update the CSIP log code for your internal records (optional)').should('be.visible')
    getLogCodeInput().should('have.value', 'LEI123')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getLogCodeInput().clear().type('a'.repeat(11), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /CSIP log code must be 10 characters or less/i })
      .should('be.visible')
      .click()
    getLogCodeInput().should('be.focused')

    resetInputs()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter a CSIP log code/i })
      .should('be.visible')
      .click()
    getLogCodeInput().should('be.focused')
  }

  const completeInputs = () => {
    resetInputs()

    getLogCodeInput().clear().type('New-Code', { delay: 0 })
  }
})
