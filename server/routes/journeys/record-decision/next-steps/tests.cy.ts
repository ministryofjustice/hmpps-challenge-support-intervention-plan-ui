import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-decision/next-steps', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Add any comments on next steps (optional)' })
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

    cy.url().should('to.match', /\/next-steps$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-decision$/)
    cy.visit(`${uuid}/record-decision/next-steps`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Add any comments on next steps \(optional\)/ }).should('be.visible')
    cy.findByText('updating Testname User’s non-associations').should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /conclusion$/)
  }

  const validateErrorMessage = () => {
    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()

    cy.findByRole('link', { name: /Comments on next steps must be 4,000 characters or less/i })
      .should('be.visible')
      .click()

    getInputTextbox().should('be.focused')

    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>", { delay: 0 })
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /\/additional-information$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }
})
