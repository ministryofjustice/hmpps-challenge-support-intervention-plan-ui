import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /referral/contributory-factor-comment', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/contributory-factors`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getFactor = () => cy.findByRole('checkbox', { name: 'Factor1' })

  const resetInputs = () => {
    getFactor().uncheck()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubContribFactors')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorMessagesMandatory()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/contributory-factors-comments$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByText('What are the contributory factors?').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /reasons$/)
  }

  const validateErrorMessagesMandatory = () => {
    resetInputs()

    getContinueButton().click()

    cy.findByRole('link', { name: /Select the contributory factors/i })
      .should('be.visible')
      .click()
    getFactor().should('be.focused')
  }

  const completeInputs = () => {
    resetInputs()

    getFactor().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()
    getFactor().should('be.checked')
  }
})
