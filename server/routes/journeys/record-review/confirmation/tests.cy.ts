import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /record-review/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases for remain on csip', () => {
    cy.signIn()
    cy.visit(START_URL)
    cy.visit(`${uuid}/record-review/confirmation`)

    validatePageContents(false)

    checkAxeAccessibility()
  })

  it('should try out all cases for close csip', () => {
    cy.signIn()
    cy.visit(START_URL)
    injectJourneyDataAndReload(uuid, {
      review: {
        outcome: 'CLOSE_CSIP',
      },
    })
    cy.visit(`${uuid}/record-review/confirmation`)

    validatePageContents(true)

    checkAxeAccessibility()
  })

  const validatePageContents = (csipClosed: boolean) => {
    cy.findByRole('link', { name: /Digital Prison Services/ }).should('be.visible')
    cy.findByRole('link', { name: /^CSIP/ }).should('be.visible')

    cy.findByRole('heading', { name: /What to do next/ }).should('be.visible')
    if (csipClosed) {
      cy.findByText(
        /Make sure the people responsible for supporting the prisoner are informed that the plan has been closed/i,
      ).should('be.visible')
      cy.findByText('Review recorded and CSIP closed for Testname User').should('be.visible')
      cy.findByRole('link', { name: /View the closed plan/i }).should('be.visible')
      cy.findByRole('link', { name: /View the closed plan/i })
        .should('have.attr', 'href')
        .and('include', `csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/plan`)
      cy.findByRole('link', { name: /View all CSIPs/i }).should('not.exist')
    } else {
      cy.findByText(
        /Make sure the people responsible for supporting the prisoner are informed that the plan has been reviewed/i,
      ).should('be.visible')
      cy.findByText('CSIP review recorded for Testname User').should('be.visible')
      cy.findByRole('link', { name: /View the plan for Testname User/i }).should('be.visible')
      cy.findByRole('link', { name: /View the plan for Testname User/i })
        .should('have.attr', 'href')
        .and('include', `csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/plan`)
      cy.findByRole('link', { name: /View all CSIPs/i }).should('be.visible')
      cy.findByRole('link', { name: /View all CSIPs/i })
        .should('have.attr', 'href')
        .and('include', `manage-csips`)
    }
  }
})
