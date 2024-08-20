import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /screen/screen', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`
  const PAGE_URL = `${uuid}/screen`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getOutcomeType = () => cy.findByRole('radio', { name: 'Another option' })
  const getReasonForDecision = () => cy.findByRole('textbox', { name: 'Describe the reasons for this decision' })

  const resetInputs = () => {
    getReasonForDecision().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubOutcomeType')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/check-answers$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Screen a CSIP referral' }).should('be.visible')

    cy.findByText('Screen a CSIP referral').should('be.visible')

    cy.findByRole('group', { name: 'What’s the outcome of Safer Custody screening?' }).should('be.visible')

    cy.findByRole('textbox', { name: 'Describe the reasons for this decision' }).should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Select the outcome of Safer Custody screening/i })
      .should('be.visible')
      .click()
    getOutcomeType().should('be.focused')
    cy.findAllByText('Select the outcome of Safer Custody screening').should('have.length', 2)

    cy.findByRole('link', { name: /Enter a description of the reasons for this decision/i })
      .should('be.visible')
      .click()
    getReasonForDecision().should('be.focused')
    cy.findAllByText('Enter a description of the reasons for this decision').should('have.length', 2)
  }

  const completeInputs = () => {
    resetInputs()

    getOutcomeType().click()

    getReasonForDecision().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    getOutcomeType().should('be.checked')

    getReasonForDecision().should('have.value', 'textarea input')
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getReasonForDecision().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Description must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getReasonForDecision().should('be.focused')
    getReasonForDecision().should('have.value', 'a'.repeat(4001))
  }
})
