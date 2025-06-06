import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /record-decision', () => {
  const uuid = uuidV4()

  const getSignedOffByRole = () => cy.findByRole('radio', { name: /SignerRole1/ })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubDecisionSignerRoles')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/record-decision$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
  })

  it('should deny access if not a CSIP processor', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`, {
      failOnStatusCode: false,
    })
    cy.findByText('You do not have permission to access this page').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`)
  }

  const validatePageContents = () => {
    cy.get('.govuk-back-link')
      .eq(0)
      .should('have.attr', 'href', '/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550')
      .should('have.text', 'Back to CSIP record')

    cy.title().should('equal', 'Who’s signing off on this decision? - Record a CSIP investigation decision - DPS')
    cy.findByRole('heading', { name: /Who’s signing off on this decision?/ }).should('be.visible')
    cy.findByRole('radio', { name: /SignerRole1/ }).should('exist')
    cy.findByRole('radio', { name: /SignerRole2/ }).should('exist')
    getContinueButton().should('be.visible')
  }

  const validateErrorMessage = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select who’s signing off on the decision/i })
      .should('be.visible')
      .click()

    getSignedOffByRole().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getSignedOffByRole().click()
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /\/conclusion$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getSignedOffByRole().should('be.checked')
  }
})
