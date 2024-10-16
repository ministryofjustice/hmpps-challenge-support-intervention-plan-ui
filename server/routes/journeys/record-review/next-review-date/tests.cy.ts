import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-review/next-review-date', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`
  const PAGE_URL = `${uuid}/record-review/next-review-date`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getNextReviewDate = () =>
    cy.findByRole('textbox', { name: 'When will you next review the plan with Testname User?' })

  const resetInputs = () => {
    getNextReviewDate().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()
    validateErrorMessagesDate()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/record-review$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Set a date for the next CSIP review' }).should('be.visible')

    cy.findByText('Record a CSIP review').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /outcome$/)

    cy.findByText('For example, 24/9/2024.').should('be.visible')

    getNextReviewDate().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter a date for the next review/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    cy.findAllByText('Enter a date for the next review').should('have.length', 2)
  }

  const validateErrorMessagesDate = () => {
    resetInputs()

    getNextReviewDate().type('27/13/2024', { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Next review date must be a real date/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    getNextReviewDate().should('have.value', '27/13/2024')

    getNextReviewDate().clear().type('01/01/2024', { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Next review date must be today or in the future/i })
      .should('be.visible')
      .click()
    getNextReviewDate().should('be.focused')
    getNextReviewDate().should('have.value', '01/01/2024')
  }

  const completeInputs = () => {
    resetInputs()

    getNextReviewDate().type('27/8/2035', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getNextReviewDate().should('have.value', '27/08/2035')
  }
})
