import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { todayString } from '../../../../utils/datetimeUtils'

context('test /update-review/close-csip', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-review/start`
  const PAGE_URL = `${uuid}/update-review/close-csip`

  const getCloseButton = () => cy.findByRole('button', { name: 'Yes, close CSIP' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases - with no open identified needs', () => {
    cy.task('stubPatchReviewSuccess')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          reviews: [{}],
          identifiedNeeds: [],
        },
      },
    })

    cy.findByText(
      /There (are|is) \d open identified needs? in Tes'name User's plan. These will be closed when you close the CSIP./,
    ).should('not.exist')

    checkAxeAccessibility()
    validatePageContents()
    getCloseButton().click()
    urlShouldMatchCsipRecordAndDisplaySuccessMessage()
  })

  it('should try out all cases - with one open identified need', () => {
    cy.task('stubPatchReviewSuccess')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          reviews: [{}],
          identifiedNeeds: [{}, { closedDate: todayString() }],
        },
      },
    })

    cy.findByText(
      "There is 1 open identified need in Tes'name User’s plan. These will be closed when you close the CSIP.",
    ).should('be.visible')

    checkAxeAccessibility()
    validatePageContents()
    getCloseButton().click()
    urlShouldMatchCsipRecordAndDisplaySuccessMessage()
  })

  it('should try out all cases - with multiple open identified need', () => {
    cy.task('stubPatchReviewSuccess')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          reviews: [{}],
          identifiedNeeds: [{}, {}],
        },
      },
    })

    cy.findByText(
      "There are 2 open identified needs in Tes'name User’s plan. These will be closed when you close the CSIP.",
    ).should('be.visible')

    checkAxeAccessibility()
    validatePageContents()
    getCloseButton().click()
    urlShouldMatchCsipRecordAndDisplaySuccessMessage()
  })

  it('should handle patch failure', () => {
    cy.task('stubPatchReviewFail')
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
          reviews: [{}],
          identifiedNeeds: [{}, {}],
        },
      },
    })

    getCloseButton().click()
    cy.findByText('There is a problem')
    cy.findByText('Simulated Error for E2E testing')
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'Are you sure you want to close this CSIP? - Update a CSIP review - DPS')
    cy.findByRole('heading', { name: 'Are you sure you want to close this CSIP?' }).should('be.visible')

    cy.findByText('Update a CSIP review').should('be.visible')

    cy.findByText('It’s important that the plan is up to date before you record the final review.').should('be.visible')
    cy.findByText('You will not be able to add or change any information after closing the CSIP.').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /outcome$/)
  }

  const urlShouldMatchCsipRecordAndDisplaySuccessMessage = () => {
    cy.findByText('You’ve updated the review outcome and closed the CSIP.')
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }
})
