import { v4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/start`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised$/)
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

  it('state guard should prevent accessing pages ahead in flow', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')

    const uuid = v4()
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)

    injectJourneyDataAndReload(uuid, {
      stateGuard: true,
    })

    cy.findByRole('button', { name: /Add another identified need/ }).click()

    cy.visit(`${uuid}/update-plan/check-answers`)
    cy.url().should('to.match', /update-plan\/summarise-identified-need$/)

    cy.findByRole('textbox').type('identified need')
    cy.findByRole('button', { name: /Continue/ }).click()

    cy.visit(`${uuid}/update-plan/check-answers`)
    cy.url().should('to.match', /update-plan\/intervention-details$/)

    cy.findAllByRole('textbox').eq(0).type('idklol')
    cy.findAllByRole('textbox').eq(1).type('idklol')
    cy.findAllByRole('textbox').eq(2).type('01/01/2038')

    cy.findByRole('button', { name: /Continue/ }).click()

    cy.visit(`${uuid}/update-plan/check-answers`)
    cy.url().should('to.match', /\/check-answers$/)
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
    cy.title().should('to.match', /Update a plan - DPS/)
    cy.findByRole('heading', { name: /Update Tes'name User’s plan/ }).should('be.visible')
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
      .and('match', /\/next-review-date#nextCaseReviewDate/)
    cy.findByRole('link', { name: /Add, change, close or reopen identified needs/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/csip-record\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/update-plan\/identified-needs\/start$/)
  }
})
