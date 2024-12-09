import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /screen/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`
  const PAGE_URL = `${uuid}/screen/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should display page correctly for all outcomes', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    setupData('PLAN_PENDING')
    cy.visit(PAGE_URL)
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      "A CSIP Case Manager should be allocated to work with Tes'name User to develop an initial plan.",
    ).should('be.visible')

    setupData('INVESTIGATION_PENDING')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      "This should include interviewing Tes'name User about the behaviour that led to the referral.",
    ).should('be.visible')

    setupData('NO_FURTHER_ACTION')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      'Make sure the people responsible for supporting the prisoner are informed of the screening decision.',
    ).should('be.visible')

    setupData('SUPPORT_OUTSIDE_CSIP')
    checkAxeAccessibility()
    validatePageContents()
    cy.findByText(
      'Make sure the people responsible for supporting the prisoner are informed of the screening decision.',
    ).should('be.visible')
  })

  const setupData = (outcome: string) => {
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        status: {
          code: outcome,
          description: outcome,
        },
      },
    })
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
