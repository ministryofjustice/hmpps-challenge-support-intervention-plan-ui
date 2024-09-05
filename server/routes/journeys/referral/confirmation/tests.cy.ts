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
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    cy.visit(`${uuid}/referral/additional-information`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/area-of-work`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/check-answers`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/contributory-factors`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/contributory-factors-comments`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/description`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/details`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/involvement`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/on-behalf-of`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/proactive-or-reactive`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/reasons`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/referrer`)
    cy.url().should('match', /confirmation$/)
    cy.visit(`${uuid}/referral/safer-custody`)
    cy.url().should('match', /confirmation$/)
  })

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^CSIP/i }).should('have.attr', 'href').and('match', /\//)

    cy.findByText('CSIP referral complete').should('be.visible')

    cy.findByText('What happens next').should('be.visible')
    cy.findByText('We’ve sent the referral to the Safer Custody team.').should('be.visible')
    cy.findByText('They might contact you:').should('be.visible')
    cy.findByText('if they need more information to make a decision on next steps').should('be.visible')
    cy.findByText('to provide guidance on actions if the referral does not procede to an investigation or plan').should(
      'be.visible',
    )
  }
})
