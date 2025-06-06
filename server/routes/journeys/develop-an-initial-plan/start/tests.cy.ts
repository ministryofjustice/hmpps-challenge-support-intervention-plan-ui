import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/develop-an-initial-plan/start', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should redirect to /record-decision', () => {
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/develop-an-initial-plan$/)
  })

  it('should redirect to root if CSIP record is not found', () => {
    cy.task('stubGetCsipOverview')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`)
    cy.url().should('to.match', /http:\/\/localhost:3007\/$/)
  })

  it('should redirect to CSIP record screen if prisoner is not found', () => {
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })

  it('should deny access if not a CSIP processor', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })
    cy.findByText('You do not have permission to access this page').should('be.visible')
  })
})
