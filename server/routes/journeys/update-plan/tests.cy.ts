import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /update-plan', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('should render the update plan screen', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')
    navigateToTestPage()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-plan$/)
    checkAxeAccessibility()
    validatePageContents()
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordSuccessPlanPending')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)

    cy.findAllByRole('link', { name: /update plan/i })
      .should('be.visible')
      .first()
      .click()
  }

  const validatePageContents = () => {
    cy.title().should('to.match', /Update a plan - CSIP - DPS/)
    cy.findByRole('heading', { name: /Update Testname User’s plan/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByRole('link', { name: /Change the Case Manager/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/case-management#caseManager$/)
    cy.findByRole('link', { name: /Change the reason for the plan/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/case-management#reasonForPlan$/)
    cy.findByRole('link', { name: /Change the next review date/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/next-review-date#firstCaseReviewDate$/)
    cy.findByRole('link', { name: /Add, change, close or reopen identified needs/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/csip-record\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/update-plan\/identified-needs\/start$/)
  }
})
