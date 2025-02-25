import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /csip-record/:recordUuid/change-screen/start', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/change-screen/start`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should redirect to /change-screen', () => {
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.url().should('to.match', /\/check-change-screen$/)
    checkAxeAccessibility()
  })

  it('should disallow access when CSIP processor role not present', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised/)
  })

  it('should disallow access when investigation pending but screening outcome is support outside CSIP', () => {
    cy.task('stubCsipRecordGetSuccessAfterScreeningSupportOutsideCsip')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  })

  it('should disallow access when plan pending but screening outcome is support outside CSIP', () => {
    cy.task('stubCsipRecordSuccessPlanPending')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  })

  it('should disallow access when neither plan pending nor investigation pending', () => {
    cy.task('stubCsipRecordSuccessAwaitingDecisionNoInterviews')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  })

  it('should redirect to root if CSIP record is not found', () => {
    cy.task('stubGetCsipOverview')
    cy.signIn()
    cy.visit(START_URL)
    cy.url().should('to.match', /http:\/\/localhost:3007\/$/)
  })

  it('should redirect to CSIP record screen if prisoner is not found', () => {
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(START_URL, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })

  it('should allow access when plan pending and screening outcome is progress to CSIP', () => {
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordSuccessPlanPendingCUR')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.url().should('to.match', /\/check-change-screen$/)
  })
})
