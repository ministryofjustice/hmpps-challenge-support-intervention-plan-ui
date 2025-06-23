import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { todayString } from '../../../../utils/datetimeUtils'

context('test /record-review/close-csip', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`
  const PAGE_URL = `${uuid}/record-review/close-csip`

  const getCloseButton = () => cy.findByRole('button', { name: 'Yes, close CSIP' })
  const getCancelButton = () => cy.findByRole('button', { name: 'No, change outcome' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases - with no open identified needs', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    cy.findByText(
      /There (are|is) \d open identified needs? in Tes'name User's plan. These will be closed when you close the CSIP./,
    ).should('not.exist')

    checkAxeAccessibility()
    validatePageContents()
    getCloseButton().click()
    cy.url().should('to.match', /\/record-review$/)

    cy.go('back')
    getCancelButton().click()
  })

  it('should try out all cases - with one open identified need', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
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
    cy.url().should('to.match', /\/record-review$/)
  })

  it('should try out all cases - with multiple open identified need', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        plan: {
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
    cy.url().should('to.match', /\/record-review$/)
  })

  const validatePageContents = () => {
    cy.title().should(
      'equal',
      'Are you sure you want to record the final review and close this CSIP? - Record a CSIP review - DPS',
    )
    cy.findByRole('heading', { name: 'Are you sure you want to record the final review and close this CSIP?' }).should(
      'be.visible',
    )

    cy.findByText('Record a CSIP review').should('be.visible')

    cy.findByText('It’s important that the plan is up to date before you record the final review.').should('be.visible')
    cy.findByText('You will not be able to add or change any information after closing the CSIP.').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /outcome$/)
  }
})
