import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /record-review/outcome', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`
  const PAGE_URL = `${uuid}/record-review/outcome`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getOutcomeClose = () => cy.findByRole('radio', { name: 'Close the CSIP' })
  const getOutcomeRemain = () =>
    cy.findByRole('radio', { name: 'What’s the outcome of this review? Keep the prisoner on the plan' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should redirect to close csip', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    getOutcomeClose().click()

    getContinueButton().click()
    cy.url().should('to.match', /\/close-csip$/)
    cy.go('back')

    cy.reload()
    getOutcomeClose().should('be.checked')
  })

  it('should redirect to next review date', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()

    getOutcomeRemain().click()

    getContinueButton().click()
    cy.url().should('to.match', /\/next-review-date$/)
    cy.go('back')

    cy.reload()
    getOutcomeRemain().should('be.checked')
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'What’s the outcome of this review? - Record a CSIP review - DPS')
    cy.findByText('Record a CSIP review').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/record-review$/)
  }

  const validateErrorsMandatory = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select the outcome of the review./i })
      .should('be.visible')
      .click()
    getOutcomeRemain().should('be.focused')
    cy.findAllByText('Select the outcome of the review.').should('have.length', 2)
  }
})
