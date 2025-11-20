import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /change-screen', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/change-screen/start`
  const PAGE_URL = `${uuid}/change-screen`

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
    cy.task('stubScreeningOutcomeType')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      saferCustodyScreening: {
        outcomeType: { code: 'ACC', description: 'Another option' },
      },
    })

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

  it('CSRF redirects to sign-out when tampered with', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    completeInputs()

    getContinueButton().click()

    cy.url().should('to.match', /\/check-answers$/)
    cy.go('back')
    cy.location('pathname').should('eq', `/${PAGE_URL}`)

    cy.get('input[name="_csrf"]').first().invoke('val', 'changed value')

    getContinueButton().click()

    cy.url().should('to.match', /\/sign-out/)
  })

  it('should deny access if not a CSIP processor', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.signIn({ failOnStatusCode: false })
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.findByText('You do not have permission to access this page').should('be.visible')
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Screen a CSIP referral' }).should('be.visible')

    cy.findByText('Change CSIP referral screening').should('be.visible')

    cy.findByRole('group', { name: 'What’s the outcome of Safer Custody screening?' }).should('be.visible')

    cy.findByRole('textbox', { name: 'Describe the reasons for this decision' }).should('be.visible')

    getOutcomeType().should('be.checked')

    getReasonForDecision().should('have.value', 'a very well thought out reason')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

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
