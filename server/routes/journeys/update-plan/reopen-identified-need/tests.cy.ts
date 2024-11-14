import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /updatel-plan/reopen-identified-need', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should test reopen-identified-need', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()

    cy.url().should('to.match', /reopen-identified-need\/[a-zA-Z0-9-]*/i)

    checkAxeAccessibility()

    validatePageContents()

    cy.findByRole('button', { name: /Reopen need/i }).click()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve reopened an identified need in this plan.').should('be.visible')
  })

  it('should error when a need is not closed', () => {
    navigateToTestPage()
    cy.visit(
      `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/reopen-identified-need/a0000000-f7b1-4c56-bec8-69e390eb0003`,
      { failOnStatusCode: false },
    )

    checkAxeAccessibility()

    cy.findByText('Page not found')
  })

  it('should error when a need is not found', () => {
    navigateToTestPage()
    cy.visit(
      `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/reopen-identified-need/somethingidk`,
      { failOnStatusCode: false },
    )
    cy.url().should('to.match', /reopen-identified-need\/[a-zA-Z0-9-]*/i)

    checkAxeAccessibility()

    cy.findByText('Page not found')
  })

  it('should handle API errors', () => {
    cy.task('stubPatchIdentifiedNeedFail')
    navigateToTestPage()
    cy.findByRole('button', { name: /Reopen need/i }).click()

    cy.url().should('to.match', /reopen-identified-need\/[a-zA-Z0-9-]*/i)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('link', { name: /Reopen the identified need "closed need"/ }).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Are you sure you want to reopen this identified need? - Update plan - DPS')
    cy.findByRole('heading', { name: /Are you sure you want to reopen this identified need\?/i }).should('be.visible')

    cy.findByRole('heading', { name: 'closed need' }).should('be.visible')
    cy.findByText('joe bloggs').should('be.visible')
    cy.findByText('1 May 2024').should('be.visible')
    cy.findByText('2 June 2024').should('be.visible')
    cy.findAllByText('closed need').should('have.length', 2)
    cy.findByText('we need to do things').should('be.visible')
    cy.findByText('Not provided').should('be.visible')
    cy.findByText('1 April 2024').should('be.visible')

    cy.findByRole('button', { name: /Reopen need/i }).should('be.visible')

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }
})
