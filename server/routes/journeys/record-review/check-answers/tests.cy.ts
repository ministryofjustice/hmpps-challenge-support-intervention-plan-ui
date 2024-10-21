import { v4 as uuidV4 } from 'uuid'
import { format, startOfTomorrow } from 'date-fns'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-review/check-answers', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
    cy.task('stubPostReview')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    injectJourneyDataAndReload(uuid, {
      isCheckAnswers: true,
      review: {
        reviewDate: '2024-04-05',
        attendees: [
          {
            contribution: 'acontrib',
            isAttended: false,
            name: 'bar footerton',
            role: 'arole',
          },
        ],
        nextReviewDate: '2024-05-06',
        outcome: 'CLOSE_CSIP',
        summary: 'a summary',
      },
    })

    cy.visit(`${uuid}/record-review/check-answers`)

    cy.url().should('to.match', /\/check-answers$/)
    checkAxeAccessibility()

    cy.findByRole('heading', { name: /Check your answers before recording the review/ }).should('be.visible')

    cy.findByRole('heading', { name: /Review information/ }).should('be.visible')
    cy.contains('dt', 'Review details').next().should('include.text', 'a summary')
    cy.contains('dt', 'Review outcome').next().should('include.text', 'Close the CSIP')
    cy.contains('dt', 'Next review date').next().should('include.text', '06 May 2024')

    cy.findByRole('link', { name: /change the details of the review/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /details#summary$/)
    cy.findByRole('textbox').clear().type('new details', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Review details').next().should('include.text', 'new details')

    cy.findByRole('link', { name: /change the review outcome/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /outcome#outcome$/)
    cy.findByRole('radio', { name: /Keep the prisoner on the plan/i }).click()
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Review outcome').next().should('include.text', 'Keep the prisoner on a plan')

    cy.findByRole('link', { name: /change the next review date/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /next-review-date#nextReviewDate$/)
    cy.findByRole('textbox').clear().type(format(startOfTomorrow(), 'dd/MM/yyyy'), { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Next review date').next().should('include.text', format(startOfTomorrow(), 'dd MMMM yyyy'))

    cy.contains('dt', 'Name').next().should('include.text', 'bar footerton')
    cy.contains('dt', 'Role').next().should('include.text', 'arole')
    cy.contains('dt', 'Attended in person').next().should('include.text', 'No')
    cy.contains('dt', 'Contribution').next().should('include.text', 'acontrib')
    cy.findByRole('link', { name: /Add, change or delete participants and contributions/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participants-summary$/)
    cy.findByRole('link', { name: /change the participant’s name/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /participant-contribution-details\/1#name$/)

    cy.findByRole('textbox', { name: /What’s the participant’s name\?/ })
      .clear()
      .type('newname', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Name').next().should('include.text', 'newname')

    cy.findByRole('button', { name: /Continue/i }).click()

    continueToConfirmation()
  })

  it('should render differently if attended in person and this will close the csip', () => {
    navigateToTestPage()

    injectJourneyDataAndReload(uuid, {
      isCheckAnswers: true,
      review: {
        reviewDate: '2024-04-05',
        attendees: [
          {
            contribution: 'acontrib',
            isAttended: true,
            name: 'bar footerton',
            role: 'arole',
          },
        ],
        nextReviewDate: '2024-05-06',
        outcome: 'CLOSE_CSIP',
        summary: 'a summary',
      },
    })

    cy.visit(`${uuid}/record-review/check-answers`)

    cy.url().should('to.match', /\/check-answers$/)

    cy.contains('dt', 'Attended in person').next().should('include.text', 'Yes')

    cy.findByText(/you will not be able to add or change any information after closing the csip/i).should('be.visible')
    cy.findByRole('button', { name: /record review and close csip/i }).click()
  })

  it('should not allow continuing if all attendees are deleted', () => {
    navigateToTestPage()

    injectJourneyDataAndReload(uuid, {
      isCheckAnswers: true,
      review: {
        reviewDate: '2024-04-05',
        attendees: [
          {
            contribution: 'acontrib',
            isAttended: true,
            name: 'bar footerton',
            role: 'arole',
          },
        ],
        nextReviewDate: '2024-05-06',
        outcome: 'REMAIN_ON_CSIP',
        summary: 'a summary',
      },
    })

    cy.visit(`${uuid}/record-review/check-answers`)

    cy.url().should('to.match', /\/check-answers$/)

    cy.findByRole('link', { name: /Add, change or delete participants and contributions/i })
      .should('be.visible')
      .click()

    cy.findByRole('link', { name: /delete the information about the participant/i })
      .should('be.visible')
      .click()

    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/participants-summary$/)
    cy.findByText(/No participants recorded./).should('be.visible')
    cy.findByRole('button', { name: /Continue/i }).should('not.exist')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)
    cy.url().should('to.match', /\/record-review$/)
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and record review/i }).click()
    cy.url().should('to.match', /\/confirmation(#[A-z]+)?$/)
  }
})