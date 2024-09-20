import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-referral/add-contributory-factor', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getFactor = () => cy.findByRole('radio', { name: 'Factor2' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/update-referral\/add-contributory-factor$/)

    checkAxeAccessibility()
    validatePageContents()
    validateErrorMessagesMandatory()
    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/new-code2-comment$/)
    cy.findByRole('link', { name: /^back$/i }).click()

    verifyDetailsAreRestoredFromJourney()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('button', { name: /Add another contributory factor/i }).click()
  }

  const validatePageContents = () => {
    cy.findByText('Add another contributory factor').should('be.visible')
  }

  const validateErrorMessagesMandatory = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select the contributory factor/i })
      .should('be.visible')
      .click()
    getFactor().should('be.focused')
  }

  const completeInputs = () => {
    getFactor().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()
    getFactor().should('be.checked')
  }
})
