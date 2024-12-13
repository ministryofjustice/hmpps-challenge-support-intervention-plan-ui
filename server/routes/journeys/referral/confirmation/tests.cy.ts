import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
  })

  it('should display page correctly', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    injectJourneyDataAndReload(uuid, {
      journeyCompleted: true,
      stateGuard: true,
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'CSIP referral complete - DPS')
    cy.findByRole('link', { name: /^CSIP/i }).should('have.attr', 'href').and('match', /\//)

    cy.findByText('CSIP referral complete').should('be.visible')

    cy.findByText('What happens next').should('be.visible')
    cy.findByText('The referral has been submitted to the Safer Custody team.').should('be.visible')
    cy.findByText('They might contact you:').should('be.visible')
    cy.findByText('if they need more information to make a decision on next steps').should('be.visible')
    cy.findByText(
      'to provide guidance on actions if the referral does not progress to an investigation or a plan',
    ).should('be.visible')

    cy.findByRole('link', { name: "View CSIP details for Tes'name User" })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/manage-csips\?query=A1111AA$/)
    cy.findByRole('link', { name: 'View all CSIPs for Leeds (HMP)' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/manage-csips\?clear=true$/)
  }
})
