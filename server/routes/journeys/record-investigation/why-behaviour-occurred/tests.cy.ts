import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/why-behaviour-occurred', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Why did the behaviour occur?' })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/why-behaviour-occurred$/)
    cy.title().should('equal', 'Why did the behaviour occur? - Record a CSIP investigation - DPS')
    checkAxeAccessibility()

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-investigation$/)
    cy.visit(`${uuid}/record-investigation/why-behaviour-occurred`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Why did the behaviour occur\?/ }).should('be.visible')
    cy.findByText(
      /Include any reasons the prisoner has given about why the behaviour occurred\.\s*You can also include reasons reported by other people\./,
    ).should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /record-investigation$/)
  }

  const validateErrorMessage = () => {
    getContinueButton().click()
    cy.title().should('equal', 'Error: Why did the behaviour occur? - Record a CSIP investigation - DPS')
    cy.findByRole('link', { name: /Enter a description of why the behaviour occurred/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Description of why the behaviour occurred must be 4,000 characters or less/i,
    })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)

    cy.pageCheckCharacterThresholdMessage(getInputTextbox(), 4000)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>", { delay: 0 })
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /record-investigation$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }
})
