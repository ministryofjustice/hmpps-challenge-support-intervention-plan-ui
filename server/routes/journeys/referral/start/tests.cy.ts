import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/referral/start', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should redirect to /referral', () => {
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.visit(`${uuid}/prisoners/A1111AA/referral/start`, { failOnStatusCode: false })
    cy.url().should('to.match', /\/referral\/on-behalf-of$/)
  })

  it('should redirect to dps prisoner search page if prisoner is not found', () => {
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
    cy.request({ url: `${uuid}/prisoners/A1111AA/referral/start`, failOnStatusCode: false })
    cy.url().should('to.match', /\//)
  })
})
