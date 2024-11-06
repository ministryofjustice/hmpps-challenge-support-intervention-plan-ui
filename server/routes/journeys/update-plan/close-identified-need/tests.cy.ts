import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /updatel-plan/close-identified-need', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should test delete-identified-need', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()

    cy.url().should('to.match', /close-identified-need\/[a-zA-Z0-9-]*/i)

    checkAxeAccessibility()

    validatePageContents()

    cy.findByRole('button', { name: /Close need/i }).click()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve closed an identified need in this plan.').should('be.visible')
  })

  it('should handle API errors', () => {
    cy.task('stubPatchIdentifiedNeedFail')
    navigateToTestPage()
    cy.findByRole('button', { name: /Close need/i }).click()

    cy.url().should('to.match', /close-identified-need\/[a-zA-Z0-9-]*/i)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('link', { name: /Close the identified need "first need"/ }).click()
  }

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^back/i }).should('be.visible')
    cy.findByRole('heading', { name: /Are you sure you want to close this identified need\?/i }).should('be.visible')

    cy.findByRole('heading', { name: 'first need' }).should('be.visible')
    cy.findByText('test testerson').should('be.visible')
    cy.findByText('2 April 2024').should('be.visible')
    cy.findByText('get it sorted').should('be.visible')
    cy.findByText('progression done').should('be.visible')
    cy.findByText('1 March 2024').should('be.visible')

    cy.findByRole('button', { name: /Close need/i }).should('be.visible')

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }
})
