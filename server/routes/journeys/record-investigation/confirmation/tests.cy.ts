import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubIntervieweeRoles')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL)
    cy.visit(`${uuid}/record-investigation/confirmation`)
    cy.title().should('equal', 'CSIP investigation recorded - DPS')

    validatePageContents()

    checkAxeAccessibility()
  })

  const validatePageContents = () => {
    cy.findByRole('link', { name: /Digital Prison Services/ }).should('be.visible')
    cy.get('.csip-breadcrumbs__breadcrumbs').findByRole('link', { name: /CSIP/ }).should('be.visible')

    cy.findByText('CSIP investigation recorded').should('be.visible')
    cy.findByText('Status: Awaiting decision').should('be.visible')

    cy.findByRole('heading', { name: /What needs to happen next/ }).should('be.visible')
    cy.findByText(
      'The Custodial Manager should assess the findings of the investigation and make a decision about whether Testname User needs to be placed on a CSIP.',
    ).should('be.visible')
    cy.findByText(
      'If the Custodial Manager is not available then another appropriate person can do this, such as the Residential Governor or a Safer Custody team member.',
    ).should('be.visible')

    cy.findByRole('link', { name: 'View CSIP details for Testname User' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/manage-csips\?query=A1111AA$/)
    cy.findByRole('link', { name: 'View all CSIPs for Leeds (HMP)' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/manage-csips\?clear=true$/)
  }
})
