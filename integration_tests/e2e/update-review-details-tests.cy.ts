import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'

context('test /update-review/details', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Update the review details' })
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchReviewSuccess')
    navigateToTestPage()
    cy.url().should('to.match', /\/details$/)
    checkAxeAccessibility()

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should handle patch failure', () => {
    cy.task('stubPatchReviewFail')
    navigateToTestPage()
    cy.url().should('to.match', /\/details$/)
    checkAxeAccessibility()

    getContinueButton().click()
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-review/start`, {
      failOnStatusCode: false,
    })
    cy.visit(`${uuid}/update-review/details`)
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          reviews: [{}],
        },
      },
      review: {
        reviewUuid: '1234-56',
        summary: 'An old review summary',
      },
    })
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Update the review details - Update a CSIP review - DPS')
    cy.findByRole('heading', { name: 'Update the review details' }).should('be.visible')
    cy.findByText(/What to include in the review details/).should('be.visible')
    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /update-review$/)

    getInputTextbox().should('have.value', 'An old review summary')
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter details of the review/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Details of the review must be 4,000 characters or less/i,
    })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>", { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }
})
