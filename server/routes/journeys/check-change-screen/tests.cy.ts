import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /edit-log-code', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')
  })

  it('should redirect to home page when journey has expired or is not found', () => {
    cy.signIn()
    injectJourneyDataAndReload('12e5854f-f7b1-4c56-bec8-69e390eb8550', { stateGuard: true })
    cy.visit(`12e5854f-f7b1-4c56-bec8-69e390eb8550/check-change-screen`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/$/)
  })

  it('should try out all cases', () => {
    cy.task('stubCsipRecordPatchSuccess')
    navigateToTestPage()
    cy.url().should('to.match', /\/check-change-screen$/)

    checkAxeAccessibility()
    validatePageContents()

    cy.findByRole('button', { name: /Cancel/ })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)

    cy.go('back')

    cy.findByRole('button', { name: /Yes, change screening outcome/ })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /\/change-screen$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/change-screen/start`, {
      failOnStatusCode: false,
    })
  }

  const validatePageContents = () => {
    cy.title().should(
      'equal',
      'Are you sure you want to change the outcome for the referral screening? - Change CSIP screening outcome - DPS',
    )
    cy.findByRole('heading', {
      name: /Are you sure you want to change the outcome for the referral screening?/,
    }).should('be.visible')

    cy.findByText(
      `Changing the outcome will replace all of the following information in the CSIP referral screening for Tes'name User. This should not be used just because a prisoner has transferred.`,
    )

    cy.contains('dt', 'Screening date').next().should('include.text', `1 August 2024`)
    cy.contains('dt', 'Screening outcome').next().should('include.text', `Progress to investigation`)
    cy.contains('dt', 'Reasons for decision').next().should('include.text', `a very well thought out reason`)
    cy.contains('dt', 'Recorded by').next().should('include.text', `Test User`)

    cy.findByRole('button', { name: /Yes, change screening outcome/ }).should('be.visible')
    cy.findByRole('button', { name: /Cancel/ }).should('be.visible')
  }
})
