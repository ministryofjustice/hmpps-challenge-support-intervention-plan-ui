import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /record-review/confirmation', () => {
  let uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
    uuid = uuidV4()
  })

  it('should display page correctly for CSIP_OPEN', () => {
    navigateToTestPage('CSIP_OPEN')
    validatePageContents()
    checkAxeAccessibility()
    cy.findByText('Tell the people responsible for supporting the prisoner that the plan has been reviewed.').should(
      'be.visible',
    )
    cy.findByRole('link', { name: "Update the identified needs in Tes'name User’s plan" })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/csip-record\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/update-plan\/identified-needs\/start$/)
  })

  it('should display page correctly for CSIP_CLOSED', () => {
    navigateToTestPage('CSIP_CLOSED')
    validatePageContents()
    checkAxeAccessibility()
    cy.findByText("Tell the people responsible for supporting Tes'name User that the plan has been closed.").should(
      'be.visible',
    )
  })

  const navigateToTestPage = (outcome: string) => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`, {
      failOnStatusCode: false,
    })

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        recordUuid: '02e5854f-f7b1-4c56-bec8-69e390eb8550',
        status: {
          code: outcome,
          description: outcome,
        },
      },
    })
    cy.visit(`${uuid}/record-review/confirmation`)
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'CSIP review recorded - DPS')
    cy.findByText("CSIP review recorded for Tes'name User").should('be.visible').should('match', 'h1')

    cy.findByText('What to do next').should('be.visible').should('match', 'h2')

    cy.findByRole('link', { name: /^CSIP/i }).should('have.attr', 'href').and('match', /\//)

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
