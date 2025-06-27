import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-investigation/triggers', () => {
  const uuid = uuidV4()

  const getInputTextbox = () =>
    cy.findByRole('textbox', { name: "Add information about Tes'name User’s risks and triggers" })
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessAwaitingDecision')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchInvestigationSuccess')
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/triggers$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should handle API errors', () => {
    cy.task('stubPatchInvestigationFail')
    navigateToTestPage()

    getInputTextbox().clear().type('some text')
    getContinueButton().click()

    cy.url().should('to.match', /\/triggers$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/update-investigation$/)
    cy.visit(`${uuid}/update-investigation/triggers`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: "Add information about Tes'name User’s risks and triggers" }).should('be.visible')
    cy.findByText('spiders').should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText(/Where to find information on a prisoner’s triggers/).should('not.exist')
    cy.title().should(
      'equal',
      'Add information about the prisoner’s risks and triggers - Update a CSIP investigation - DPS',
    )
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update about the prisoner’s risks and triggers/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Update about the prisoner’s risks and triggers must be [0-9,]+ characters or less/i,
    })
      .should('be.visible')
      .click()
    cy.findAllByText(/You have [0-9,]+ characters too many/)
      .filter(':visible')
      .should('have.length.of.at.least', 1)
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('  ')
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update about the prisoner’s risks and triggers/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the investigation information.').should('be.visible')
  }
})
