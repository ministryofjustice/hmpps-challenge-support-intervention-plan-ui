import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /update-review', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('should redirect to home page when journey has expired or is not found', () => {
    cy.signIn()

    injectJourneyDataAndReload('12e5854f-f7b1-4c56-bec8-69e390eb8550', { stateGuard: true })
    cy.visit(`12e5854f-f7b1-4c56-bec8-69e390eb8550/update-review/details`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/$/)
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-review/start`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('should render the update most recent review screen', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')
    navigateToTestPage()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-review$/)
    checkAxeAccessibility()
    validatePageContents(false)
  })

  it('should render the update plan screen', () => {
    cy.task('stubCsipRecordSuccessCsipOpen', [
      {
        recordedByDisplayName: 'joe bloggs',
        attendees: [
          {
            attendeeUuid: 'attendee-uuid-1',
            name: 'Attendee Name',
            role: 'role text',
            isAttended: true,
            contribution: 'contribution text',
          },
          {
            attendeeUuid: 'attendee-uuid-2',
          },
        ],
      },
    ])
    navigateToTestPage()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-review$/)
    checkAxeAccessibility()
    validatePageContents(true)
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordSuccessCsipOpen', [])
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-review/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/reviews`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/reviews$/)

    cy.findAllByRole('link', { name: /update review/i })
      .should('be.visible')
      .first()
      .click()
  }

  const validatePageContents = (hasOnlyOneReview: boolean) => {
    if (hasOnlyOneReview) {
      cy.title().should('to.match', /Update the review - CSIP - DPS/)
      cy.findByRole('heading', { name: /Update the review of Tes'name User’s plan/ }).should('be.visible')
    } else {
      cy.title().should('to.match', /Update the most recent review - CSIP - DPS/)
      cy.findByRole('heading', { name: /Update the most recent review of Tes'name User’s plan/ }).should('be.visible')
    }

    cy.findByRole('link', { name: /cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    cy.findByRole('link', { name: /Change the details of the review/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/details#summary$/)
    cy.findByRole('link', { name: /Change the review outcome/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/outcome#outcome$/)
    cy.findByRole('link', { name: /Change the next review date/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/next-review-date#nextReviewDate$/)

    cy.findByRole('link', { name: `Change the participant’s name (Participant: Attendee Name)` })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/update-participant-contribution-details\/attendee-uuid-1#name$/)
    cy.findByRole('link', { name: `Change the participant’s role (Participant: Attendee Name)` })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/update-participant-contribution-details\/attendee-uuid-1#role$/)
    cy.findByRole('link', {
      name: `Change whether the participant attended the review meeting in person or not (Participant: Attendee Name)`,
    })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/update-participant-contribution-details\/attendee-uuid-1#isAttended$/)
    cy.findByRole('link', {
      name: `Change the description of the participant’s contribution to the review (Participant: Attendee Name)`,
    })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/update-participant-contribution-details\/attendee-uuid-1#contribution$/)

    cy.findByRole('button', { name: /Add another participant/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/participant-contribution-details$/)
  }
})
