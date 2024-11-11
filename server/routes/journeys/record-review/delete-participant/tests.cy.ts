import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /record-review/delete-participant', () => {
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

    injectJourneyDataAndReload(uuid, {
      review: {
        summary: `summary`,
        attendees: [
          {
            attendeeUuid: uuid,
            name: `joe bloggs`,
            role: `arole`,
            contribution: `acontrib`,
            isAttended: true,
          },
        ],
        outcome: `outcome`,
      },
    })

    cy.findByRole('link', { name: /delete the information about the participant/i }).click()

    cy.url().should('to.match', /\/delete-participant\/1$/)
    cy.title().should(
      'equal',
      'Are you sure you want to delete the information about this participant? - Record a CSIP review - DPS',
    )
    checkAxeAccessibility()
    cy.findByRole('heading', {
      name: /Are you sure you want to delete the information about this participant\?/,
    }).should('be.visible')

    cy.contains('dt', 'Name').next().should('include.text', 'joe bloggs')
    cy.contains('dt', 'Role').next().should('include.text', 'arole')
    cy.contains('dt', 'Attended in person').next().should('include.text', 'Yes')
    cy.contains('dt', 'Contribution').next().should('include.text', 'acontrib')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('to.match', /\/participants-summary$/)

    clickDoNotDeleteThenComeBack()

    proceedToDelete()
  })

  it('should shows 404 for invalid participant index', () => {
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      review: {
        summary: `summary`,
        attendees: [
          {
            attendeeUuid: uuid,
            name: `joe bloggs`,
            role: `arole`,
            contribution: `acontrib`,
            isAttended: true,
          },
        ],
        outcome: `outcome`,
      },
    })

    cy.visit(`${uuid}/record-review/delete-participant/99`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)
    cy.url().should('to.match', /\/record-review$/)
    cy.visit(`${uuid}/record-review/participants-summary`)
  }

  const clickDoNotDeleteThenComeBack = () => {
    cy.findByRole('button', { name: /^No, do not delete it/i }).click()
    cy.url().should('to.match', /\/participants-summary$/)
    cy.findByRole('link', { name: /delete the information about the participant/i }).click()
  }

  const proceedToDelete = () => {
    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/participants-summary$/)
    cy.findByText(/No participants recorded./).should('be.visible')
  }
})
