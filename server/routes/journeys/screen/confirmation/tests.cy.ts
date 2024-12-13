import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /screen/confirmation', () => {
  let uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
    uuid = uuidV4()
  })

  it('should display page correctly for PLAN_PENDING', () => {
    navigateToTestPage('PLAN_PENDING')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      "A CSIP Case Manager should be allocated to work with Tes'name User to develop an initial plan.",
    ).should('be.visible')
  })

  it('should display page correctly for INVESTIGATION_PENDING', () => {
    navigateToTestPage('INVESTIGATION_PENDING')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      "This should include interviewing Tes'name User about the behaviour that led to the referral.",
    ).should('be.visible')
  })

  it('should display page correctly for NO_FURTHER_ACTION', () => {
    navigateToTestPage('NO_FURTHER_ACTION')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      'Make sure the people responsible for supporting the prisoner are informed of the screening decision.',
    ).should('be.visible')
  })

  it('should display page correctly for SUPPORT_OUTSIDE_CSIP', () => {
    navigateToTestPage('SUPPORT_OUTSIDE_CSIP')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      'Make sure the people responsible for supporting the prisoner are informed of the screening decision.',
    ).should('be.visible')
  })

  const navigateToTestPage = (outcome: string) => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`, {
      failOnStatusCode: false,
    })

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        status: {
          code: outcome,
          description: outcome,
        },
      },
    })
    cy.visit(`${uuid}/screen/confirmation`)
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'CSIP screening outcome recorded - DPS')

    cy.findByRole('link', { name: /^CSIP/i }).should('have.attr', 'href').and('match', /\//)

    cy.findByText('CSIP screening outcome recorded').should('be.visible')

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
