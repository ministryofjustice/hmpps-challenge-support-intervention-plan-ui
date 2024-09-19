import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /csip-record/:recordUuid/record-investigation/start', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should redirect to /record-investigation', () => {
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-investigation$/)
    checkAxeAccessibility()
  })

  it('should redirect to root if CSIP record is not found', () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /http:\/\/localhost:3007\/$/)
  })

  it('should redirect to CSIP record screen if prisoner is not found', () => {
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })
})
