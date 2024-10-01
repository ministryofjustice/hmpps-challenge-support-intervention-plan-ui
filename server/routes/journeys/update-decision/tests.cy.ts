import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /update-decision', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubDecisionOutcomeType')
  })

  it('should render the update decision screen', () => {
    cy.task('stubCsipRecordSuccessPlanPending')
    navigateToTestPage()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-decision$/)
    checkAxeAccessibility()
    validatePageContents()
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)

    cy.findAllByRole('link', { name: /update decision/i })
      .should('be.visible')
      .first()
      .click()
  }

  const validatePageContents = () => {
    cy.title().should('to.match', /Update a CSIP investigation decision - DPS/)
    cy.findByRole('heading', { name: /Update CSIP investigation decision for Testname User/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByRole('link', { name: /add information to the description of the reasons for the decision/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/conclusion#conclusion$/)
    cy.findByRole('link', { name: /add information to the comments on next steps/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/next-steps#nextSteps$/)
    cy.findByRole('link', { name: /add information to the additional information relating to the decision/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/additional-information#actionOther$/)
  }
})
