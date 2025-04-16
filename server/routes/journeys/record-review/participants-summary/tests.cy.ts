import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-review/participants-summary', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/participants-summary$/)
    checkAxeAccessibility()

    cy.get('.govuk-back-link')
      .eq(0)
      .should('have.attr', 'href', '../record-review')
      .should('have.text', 'Back to task list')

    cy.findByRole('heading', { name: /Log participants and contributions/ }).should('be.visible')
    cy.findByText(/No participants recorded./).should('be.visible')

    cy.findByRole('button', { name: 'Add participant' }).click()
    cy.url().should('to.match', /\/participant-contribution-details\/1$/)
    cy.go('back')

    assertPageWithSubmittedReview()
    assertContributionFallbackDisplay()

    cy.findByText(/No participant recorded./).should('not.exist')

    cy.findByRole('button', { name: 'Add another participant' }).click()
    cy.url().should('to.match', /\/participant-contribution-details\/2$/)
    cy.go('back')

    continueToTaskList()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)
    cy.url().should('to.match', /\/record-review$/)
    cy.findByRole('link', { name: /Participants and contributions/i }).click()
  }

  const assertPageWithSubmittedReview = () => {
    injectJourneyDataAndReload(uuid, {
      review: {
        attendees: [
          {
            attendeeUuid: '123-abc',
            name: 'test testerson',
            role: 'thebest',
            contribution: 'acontrib',
            isAttended: true,
          },
        ],
      },
    })

    cy.findByRole('heading', { name: /Participant: test testerson/ }).should('be.visible')
    cy.findByRole('link', { name: /delete the information about the participant \(Participant: test testerson\)/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /delete-participant\/1$/)
    cy.go('back')

    cy.contains('dt', 'Name').next().should('include.text', 'test testerson')
    cy.findByRole('link', { name: /change the participant’s name/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participant-contribution-details\/1#name$/)
    cy.go('back')

    cy.contains('dt', 'Role').next().should('include.text', 'thebest')
    cy.findByRole('link', { name: /change the participant’s role/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participant-contribution-details\/1#role$/)
    cy.go('back')

    cy.contains('dt', 'Attended in person').next().should('include.text', 'Yes')
    cy.findByRole('link', { name: /change whether the participant attended the review meeting in person or not/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participant-contribution-details\/1#isAttended$/)
    cy.go('back')

    cy.contains('dt', 'Contribution').next().should('include.text', 'acontrib')
    cy.findByRole('link', { name: /change the description of the participant’s contribution to the review/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participant-contribution-details\/1#contribution$/)
    cy.go('back')
  }

  const assertContributionFallbackDisplay = () => {
    injectJourneyDataAndReload(uuid, {
      review: {
        attendees: [
          {
            attendeeUuid: '123-abc',
            name: 'test testerson',
            role: 'thebest',
            isAttended: false,
          },
        ],
      },
    })

    cy.contains('dt', 'Contribution').next().should('include.text', 'Not provided')
    cy.contains('dt', 'Attended in person').next().should('include.text', 'No')
  }

  const continueToTaskList = () => {
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.url().should('to.match', /\/record-review$/)
  }
})
