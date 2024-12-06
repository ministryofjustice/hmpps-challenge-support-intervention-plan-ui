import { v4 as uuidV4 } from 'uuid'
import { addDays, formatDate, startOfTomorrow } from 'date-fns'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { formatDateLongMonthConcise } from '../../../../utils/datetimeUtils'

context('test /update-plan/check-answers', () => {
  let uuid = uuidV4()
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
    uuid = uuidV4()
  })

  it('should show need up for submitting, links should work, should submit and go to confirmation', () => {
    cy.task('stubPostIdentifiedNeedSuccess')
    navigateToTestPage()

    checkAxeAccessibility()

    validatePageContents()

    validateChangeLinks()

    continueToConfirmation()
  })

  it('should handle API errors', () => {
    cy.task('stubPostIdentifiedNeedFail')
    navigateToTestPage()
    cy.visit(`${uuid}/update-plan/check-answers`)

    getContinueButton().click()

    cy.url().should('to.match', /\/check-answers$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const validateChangeLinks = () => {
    cy.findByRole('link', { name: /change the person responsible/i }).click()
    cy.url().should('to.match', /intervention-details#responsiblePerson/i)
    cy.findByRole('textbox', { name: /Who’s responsible for taking action\?/i })
      .clear()
      .type('person123')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Person responsible').next().should('include.text', 'person123')

    cy.findByRole('link', { name: /change the target date/i }).click()
    cy.url().should('to.match', /intervention-details#targetDate/i)
    const targetDate = formatDate(addDays(startOfTomorrow(), 5), 'yyyy-LL-dd')
    cy.findByRole('textbox', { name: /What’s the target date for progress\?/i })
      .clear()
      .type(formatDate(targetDate, 'd/L/yyyy'))
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Target date').next().should('include.text', formatDateLongMonthConcise(targetDate))

    cy.findByRole('link', { name: /change the summary of the identified need/i }).click()
    cy.url().should('to.match', /summarise-identified-need#identifiedNeed/i)
    cy.findByRole('textbox', { name: /Summarise the identified need/i })
      .clear()
      .type('needsummary123')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Identified need summary').next().should('include.text', 'needsummary123')

    cy.findByRole('link', { name: /Change the planned intervention/i }).click()
    cy.url().should('to.match', /intervention-details#intervention/i)
    cy.findByRole('textbox', { name: /What’s the planned intervention for this identified need\?/i })
      .clear()
      .type('interven123')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Planned intervention').next().should('include.text', 'interven123')

    cy.findByRole('link', { name: /Change the actions and progress/i }).click()
    cy.url().should('to.match', /record-actions-progress#progression/i)
    cy.findByRole('textbox', { name: /Record any actions or progress \(optional\)/i }).clear()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Actions and progress').next().should('include.text', 'Not provided')
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Check your answers before adding this new identified need - Update plan - DPS')
    cy.url().should('to.match', /\/check-answers$/)
    cy.findByRole('heading', { name: /Check your answers before adding this new identified need/ }).should('be.visible')

    cy.contains('dt', 'Actions and progress').next().should('include.text', 'foobarprog')
    cy.contains('dt', 'Planned intervention').next().should('include.text', 'we need to do things')
    cy.contains('dt', 'Identified need summary').next().should('include.text', 'a need')
    cy.contains('dt', 'Target date').next().should('include.text', formatDateLongMonthConcise('2024-06-02'))
    cy.contains('dt', 'Person responsible').next().should('include.text', 'joe bloggs')
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.findByRole('button', { name: /add another identified need/i }).click()
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {
          identifiedNeedUuid: '123-123-abc',
          identifiedNeed: 'a need',
          responsiblePerson: 'joe bloggs',
          createdDate: '2024-04-01',
          targetDate: '2024-06-02',
          intervention: 'we need to do things',
          progression: 'foobarprog',
        },
      },
    })
    cy.visit(`${uuid}/update-plan/check-answers`)
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /\/csip-records\/[A-z0-9-]+/)
    cy.findByText('You’ve added another identified need to this plan.').should('be.visible')
  }
})
