import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan/identified-needs', () => {
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
    checkAxeAccessibility()

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          identifiedNeeds: [
            {
              identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0001',
              identifiedNeed: 'closed need',
              responsiblePerson: 'joe bloggs',
              createdDate: '2024-04-01',
              targetDate: '2024-06-02',
              closedDate: '2024-05-01',
              intervention: 'we need to do things',
            },
            {
              identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0002',
              identifiedNeed: 'intervention nearing 4k',
              responsiblePerson: 'foo barerson',
              createdDate: '2024-04-01',
              targetDate: '2024-06-01',
              intervention: 'a'.repeat(3970),
              progression: 'almost there',
            },
            {
              identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0003',
              identifiedNeed: 'progression nearing 4k',
              responsiblePerson: 'test testerson',
              createdDate: '2024-03-01',
              targetDate: '2024-04-02',
              intervention: 'get it sorted',
              progression: 'a'.repeat(3970),
            },
          ],
        },
      },
    })

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/identified-needs$/)
    cy.visit(`${uuid}/update-plan/identified-needs`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Update identified needs in Tes'name User’s plan/ }).should('be.visible')
    checkIdentifiedNeedsDetailsExist()
    cy.findByRole('link', { name: /cancel/i }).should('be.visible')
  }

  const checkIdentifiedNeedsDetailsExist = () => {
    const getPersonResponsibleRow = () => cy.get('.govuk-summary-list__row').eq(0)
    const getTargetDateRow = () => cy.get('.govuk-summary-list__row').eq(1)
    const getSummaryRow = () => cy.get('.govuk-summary-list__row').eq(2)
    const getPlannedInterventionRow = () => cy.get('.govuk-summary-list__row').eq(3)
    const getActionsAndProgressRow = () => cy.get('.govuk-summary-list__row').eq(4)
    const getCreatedDateRow = () => cy.get('.govuk-summary-list__row').eq(5)

    cy.get('.govuk-summary-card').should('have.length', 3)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: 'progression nearing 4k' }).should('be.visible')
        getPersonResponsibleRow().should('include.text', 'test testerson')
        getTargetDateRow().should('include.text', '2 April 2024')
        getSummaryRow().should('include.text', 'progression nearing 4k')
        getPlannedInterventionRow().should('include.text', 'get it sorted')
        getActionsAndProgressRow().should('include.text', 'a'.repeat(3970))
        getCreatedDateRow().should('include.text', '1 March 2024')

        cy.findByRole('link', { name: /Change the person responsible \(progression nearing 4k\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Change the target date \(progression nearing 4k\)/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the summary of the identified need \(progression nearing 4k\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', {
          name: /Add information to the planned intervention \(progression nearing 4k\)/i,
        }).should('be.visible')
        getActionsAndProgressRow().should('have.class', 'govuk-summary-list__row--no-actions')
        cy.findByRole('link', { name: /Close the identified need "progression nearing 4k"/ }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('heading', { name: 'intervention nearing 4k' }).should('be.visible')
        getPersonResponsibleRow().should('include.text', 'foo barerson')
        getTargetDateRow().should('include.text', '1 June 2024')
        getSummaryRow().should('include.text', 'intervention nearing 4k')
        getPlannedInterventionRow().should('include.text', 'a'.repeat(3970))
        getActionsAndProgressRow().should('include.text', 'almost there')
        getCreatedDateRow().should('include.text', '1 April 2024')

        cy.findByRole('link', { name: /Change the person responsible \(intervention nearing 4k\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Change the target date \(intervention nearing 4k\)/i }).should('be.visible')
        cy.findByRole('link', {
          name: /Change the summary of the identified need \(intervention nearing 4k\)/i,
        }).should('be.visible')
        getPlannedInterventionRow().should('have.class', 'govuk-summary-list__row--no-actions')
        cy.findByRole('link', {
          name: /Add information to the actions and progress \(intervention nearing 4k\)/i,
        }).should('be.visible')
        cy.findByRole('link', { name: /Close the identified need "intervention nearing 4k"/ }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.findByRole('heading', { name: 'closed need' }).should('be.visible')
        cy.findByText('joe bloggs').should('be.visible')
        cy.findByText('2 June 2024').should('be.visible')
        cy.findByText('we need to do things').should('be.visible')
        cy.findByText('Not provided').should('be.visible')
        cy.findByText('1 April 2024').should('be.visible')
        cy.findByRole('link', { name: /Change the person responsible/i }).should('not.exist')
        cy.findByRole('link', { name: /Change the target date/i }).should('not.exist')
        cy.findByRole('link', { name: /Change the summary of the identified need/i }).should('not.exist')
        cy.findByRole('link', { name: /Add information to the planned intervention/i }).should('not.exist')
        cy.findByRole('link', { name: /Add information to the actions and progress/i }).should('not.exist')
        cy.findByRole('link', { name: /Reopen the identified need "closed need"/ }).should('be.visible')
      })
  }
})
