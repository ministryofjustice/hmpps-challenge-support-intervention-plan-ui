import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../integration_tests/support/accessibilityViolations'

context('test /record-review', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should allow me to the csip record page', () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  })

  it('should allow me to the csip record page when the dps components api populates the caseload data', () => {
    cy.task('stubGetCaseLoadsFail')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  })

  it('should take me to the journey as we dont check start or uuid-based urls', () => {
    cy.task('stubGetCaseLoadsFail')
    cy.task('stubGetServiceInfoNoAgencies')
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`)
    cy.url().should('to.match', /\/develop-an-initial-plan$/)

    cy.findByRole('radio', { name: /Yes/ }).click()
    cy.findByRole('textbox').type('foobar')
    cy.findByRole('button', { name: /Continue/ }).click()
    cy.url().should('to.match', /\/identified-needs$/)
  })

  it('should not take me to the csip record page due to no activated caseloads', () => {
    cy.task('stubGetCaseLoads')
    cy.task('stubGetServiceInfoNoAgencies')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/service-not-enabled/)
    checkAxeAccessibility()
  })

  it('should not take me to the csip record page due to MDI not being active', () => {
    cy.task('stubGetCaseLoads')
    cy.task('stubGetServiceInfoOneAgencyMDI')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/service-not-enabled/)
  })
})
