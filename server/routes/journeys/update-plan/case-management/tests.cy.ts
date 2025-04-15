import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan/case-management', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/start`
  const PAGE_URL = `${uuid}/update-plan/case-management`

  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getCaseManager = () => cy.findByRole('textbox', { name: "Who’s the Case Manager for Tes'name User’s plan?" })

  const resetInputs = () => {
    getCaseManager().clear()
    getReasonForPlan().clear()
  }

  const getReasonForPlan = () =>
    cy.findByRole('textbox', { name: "What’s the main reason why Tes'name User needs a plan?" })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordSuccessCsipOpen')
    cy.task('stubPatchPlanSuccess')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    injectJourneyDataAndReload(uuid, {
      plan: {
        caseManager: 'Aye Person',
        reasonForPlan: 'idklol',
      },
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the case management information.').should('be.visible')
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'Case management - Update plan - DPS')
    cy.findByRole('heading', { name: 'Case management' }).should('be.visible')

    cy.findByText('Update a plan').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/update-plan$/)

    cy.findByRole('link', { name: /^cancel/i })
      .should('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    getCaseManager().should('be.visible')

    getReasonForPlan().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the Case Manager’s name/i })
      .should('be.visible')
      .click()
    getCaseManager().should('be.focused')
    cy.findAllByText('Enter the Case Manager’s name').should('have.length', 2)

    cy.findByRole('link', { name: /Enter the main reason why the prisoner needs a plan/i })
      .should('be.visible')
      .click()
    getReasonForPlan().should('be.focused')
    cy.findAllByText('Enter the main reason why the prisoner needs a plan').should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getCaseManager().clear().type('a'.repeat(101), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Case Manager’s name must be 100 characters or less/i })
      .should('be.visible')
      .click()
    getCaseManager().should('be.focused')
    getCaseManager().should('have.value', 'a'.repeat(101))

    getReasonForPlan().clear().type('a'.repeat(501), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Reason why the prisoner needs a plan must be 500 characters or less/i })
      .should('be.visible')
      .click()
    getReasonForPlan().should('be.focused')
    getReasonForPlan().should('have.value', 'a'.repeat(501))

    cy.pageCheckCharacterThresholdMessage(getCaseManager(), 100)
    cy.pageCheckCharacterThresholdMessage(getReasonForPlan(), 500)
  }

  const completeInputs = () => {
    resetInputs()

    getCaseManager().type('textarea input', { delay: 0 })

    getReasonForPlan().type('textarea input', { delay: 0 })
  }
})
