import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /develop-an-initial-plan/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`
  const PAGE_URL = `${uuid}/develop-an-initial-plan/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    injectJourneyDataAndReload(uuid, {
      plan: {
        nextCaseReviewDate: '2023-12-25',
      },
    })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
    cy.url().should('to.match', /develop-an-initial-plan\/confirmation$/)
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'Initial plan recorded - DPS')
    cy.findByRole('heading', { name: "Initial plan recorded for Tes'name User" }).should('be.visible')
    cy.findByRole('heading', { name: 'How to keep this plan up to date' }).should('be.visible')
    cy.findByText('Use this service to:').should('be.visible')
    cy.findByText('record actions and progress on the identified needs').should('be.visible')
    cy.findByText('add, update and close identified needs as targets change or are met').should('be.visible')
    cy.findByText('change the Case Manager, reason for the plan and next review date').should('be.visible')

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
