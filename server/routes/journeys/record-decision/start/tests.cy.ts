import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/record-decision/start', () => {
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
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-decision$/)
  })

  it('should redirect to root if CSIP record is not found', () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`)
    cy.url().should('to.match', /http:\/\/localhost:3007\/$/)
  })

  it('should redirect to CSIP record screen if prisoner is not found', () => {
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })
})
