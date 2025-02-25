import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-decision/additional-information', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Add additional information (optional)' })
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
    checkAxeAccessibility()

    cy.url().should('to.match', /\/additional-information$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
    verifyCarriageReturnsAreStripped()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-decision$/)
    cy.visit(`${uuid}/record-decision/additional-information`)
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Add additional information - Record a CSIP investigation decision - DPS')
    cy.findByRole('heading', { name: /Add additional information \(optional\)/ }).should('be.visible')
    cy.findByText(
      'Any other information relating to the CSIP investigation decision, such as action already taken.',
    ).should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /next-steps$/)
  }

  const validateErrorMessage = () => {
    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()

    cy.title().should('equal', 'Error: Add additional information - Record a CSIP investigation decision - DPS')
    cy.findByRole('link', { name: /Additional information must be 4,000 characters or less/i })
      .should('be.visible')
      .click()

    getInputTextbox().should('be.focused')

    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>", { delay: 0 })
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /\/check-answers$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }

  const verifyCarriageReturnsAreStripped = () => {
    getInputTextbox().clear().type('a\n'.repeat(2000), { delay: 0, force: true })
    getContinueButton().click()
    cy.url().should('to.match', /\/check-answers$/)
  }
})
