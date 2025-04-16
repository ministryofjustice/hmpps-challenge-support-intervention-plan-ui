import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /record-review', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/record-review$/)

    validatePageContents()

    validatePageContentsWithInjectedJourneyData()

    proceedToNextScreen()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)
  }

  const validatePageContents = () => {
    cy.get('.govuk-back-link')
      .eq(0)
      .should('have.attr', 'href', '/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550')
      .should('have.text', 'Back to CSIP record')

    cy.title().should('equal', 'Record information about the review - Record a CSIP review - DPS')

    cy.findByRole('heading', { name: 'Record information about the review' }).should('be.visible')
    cy.findByText(/LEI123/).should('be.visible')

    cy.findByRole('link', { name: 'Details of the review' })
      .should('have.attr', 'href')
      .and('match', /record-review\/details/)

    cy.findByRole('link', { name: 'Participants and contributions' })
      .should('have.attr', 'href')
      .and('match', /record-review\/participants-summary$/)

    cy.findByRole('link', { name: 'Outcome' })
      .should('have.attr', 'href')
      .and('match', /record-review\/outcome$/)

    cy.findByRole('link', { name: 'Check and save report' }).should('not.exist')
    cy.findAllByText('Incomplete').should('have.length', 3)
    cy.findByText('Cannot save yet').should('be.visible')
  }

  const validatePageContentsWithInjectedJourneyData = () => {
    injectJourneyDataAndReload(uuid, {
      review: {
        summary: `summary`,
        attendees: [
          {
            attendeeUuid: uuid,
            name: `name`,
            role: `role`,
            contribution: `contribution`,
          },
        ],
        outcome: `outcome`,
      },
    })

    cy.findAllByText('Completed').should('have.length', 3)
    cy.findByText('Incomplete').should('be.visible')
  }

  const proceedToNextScreen = () => {
    cy.findByRole('link', { name: 'Check and save report' }).click()
    cy.url().should('to.match', /record-review\/check-answers$/)
  }
})
