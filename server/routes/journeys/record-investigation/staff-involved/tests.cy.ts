import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/staff-involved', () => {
  const uuid = uuidV4()

  const getInputTextbox = () =>
    cy.findByRole('textbox', { name: 'Which staff have been involved in the investigation?' })
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
    cy.url().should('to.match', /\/staff-involved$/)
    cy.title().should(
      'equal',
      'Which staff have been involved in the investigation? - Record a CSIP investigation - DPS',
    )
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
    cy.visit(`${uuid}/record-investigation/staff-involved`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Which staff have been involved in the investigation?' }).should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /record-investigation$/)
  }

  const validateErrorMessage = () => {
    getContinueButton().click()
    cy.title().should(
      'equal',
      'Error: Which staff have been involved in the investigation? - Record a CSIP investigation - DPS',
    )
    cy.findByRole('link', { name: /Enter the names of staff involved in the investigation/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', { name: /Names of staff involved in the investigation must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /record-investigation$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }
})
