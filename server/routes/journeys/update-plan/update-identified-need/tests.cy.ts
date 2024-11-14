import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-plan/update-identified-need', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getTextbox = () => cy.findByRole('textbox', { name: 'Change the identified need summary' })

  const resetInputs = () => {
    getTextbox().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()

    cy.url().should('to.match', /update-identified-need\/[a-zA-Z0-9-]*#identifiedNeed/i)

    checkAxeAccessibility()

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessagesTextInputTooLong()

    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the identified needs information.').should('be.visible')
  })

  it('should handle API errors', () => {
    cy.task('stubPatchIdentifiedNeedFail')
    navigateToTestPage()
    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /update-identified-need\/[a-zA-Z0-9-]*#identifiedNeed/i)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('link', { name: `Change the summary of the identified need (first need)` }).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Change the identified need summary - Update plan - DPS')
    cy.findByText('Update a plan').should('be.visible')

    getTextbox().should('be.visible').and('have.value', 'first need')
    getContinueButton().should('be.visible')

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter a summary of the identified need/i })
      .should('be.visible')
      .click()
    getTextbox().should('be.focused')
    cy.findAllByText('Enter a summary of the identified need').should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getTextbox().type('a'.repeat(1001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Summary of the identified need must be 1,000 characters or less/i })
      .should('be.visible')
      .click()
    getTextbox().should('be.focused')
    getTextbox().should('have.value', 'a'.repeat(1001))
  }

  const completeInputs = () => {
    resetInputs()
    getTextbox().clear().type('textarea input', { delay: 0 })
  }
})
