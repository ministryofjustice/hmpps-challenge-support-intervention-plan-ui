import { v4 as uuidV4 } from 'uuid'

context('test /record-decision/conclusion', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`
  const PAGE_URL = `${uuid}/record-decision/conclusion`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getOutcome = () => cy.findByRole('radio', { name: 'Another option' })
  const getConclusion = () => cy.findByRole('textbox', { name: 'Describe the reasons for the decision' })

  const resetInputs = () => {
    getConclusion().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubOutcomeType')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL)
    cy.visit(PAGE_URL)

    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/next-steps$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Investigation decision' }).should('be.visible')

    cy.findByText('Record a CSIP investigation decision').should('be.visible')

    cy.findByRole('group', { name: 'What’s the conclusion of the CSIP investigation?' }).should('be.visible')

    cy.findByText('Include the name and role of the staff member signing off on the decision.').should('be.visible')

    cy.findByRole('textbox', { name: 'Describe the reasons for the decision' }).should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Select the conclusion of the CSIP investigation/i })
      .should('be.visible')
      .click()
    getOutcome().should('be.focused')
    cy.findAllByText('Select the conclusion of the CSIP investigation').should('have.length', 2)

    cy.findByRole('link', { name: /Enter a description of the reasons for the decision/i })
      .should('be.visible')
      .click()
    getConclusion().should('be.focused')
    cy.findAllByText('Enter a description of the reasons for the decision').should('have.length', 2)
  }

  const completeInputs = () => {
    resetInputs()

    getOutcome().click()

    getConclusion().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    getOutcome().should('be.checked')

    getConclusion().should('have.value', 'textarea input')
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getConclusion().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Description of the reasons for the decision must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getConclusion().should('be.focused')
    getConclusion().should('have.value', 'a'.repeat(4001))
  }
})
