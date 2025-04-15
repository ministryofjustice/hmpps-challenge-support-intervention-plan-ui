import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /csip-records - print mode', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubIntervieweeRoles')
  })

  it('should render the page in print mode', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)

    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: {
          media: 'print',
          features: [],
        },
      }),
    )
    cy.findByRole('heading', { name: /csip for tes'name user/i }).should('be.visible')

    checkPrintView()

    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/reviews`)
    checkPrintView()

    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/investigation`)
    checkPrintView()

    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/referral`)
    checkPrintView()
  })

  const checkPrintView = () => {
    cy.findAllByRole('link').should('have.length', 0)
    cy.findAllByRole('button').should('have.length', 0)
    cy.findAllByRole('banner').should('have.length', 0)
    cy.findByText(/Beta/).should('not.be.visible')
    cy.findAllByRole('separator').should('have.length', 1) // Just the one separator, under the main heading
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    checkAxeAccessibility()
  }
})
