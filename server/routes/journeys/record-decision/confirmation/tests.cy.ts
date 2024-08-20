import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /record-decision/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`
  const PAGE_URL = `${uuid}/record-decision/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should display page correctly when outcome type is "No further action"', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    setupData('No further action')
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
  })

  it('should display page correctly when outcome type is "Progress to CSIP"', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    setupData('Progress to CSIP')
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
    cy.findByText('opening a CSIP alert').should('be.visible')
  })

  const setupData = (outcome: string) => {
    injectJourneyDataAndReload(uuid, {
      decisionAndActions: {
        signedOffByRole: { code: 'A', description: 'SignerRole1' },
        outcome: { code: 'NFA', description: outcome },
        conclusion: `<script>alert('xss-conclusion');</script>`,
        nextSteps: `<script>alert('xss-nextSteps');</script>`,
        actionOther: `<script>alert('xss-actionOther');</script>`,
      },
    })
  }

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^CSIPs/i })
      .should('have.attr', 'href')
      .and('match', /\//)

    cy.findByText('CSIP investigation decision recorded').should('be.visible')

    cy.findByText('We’ve updated the status of the referral to “referral submitted”.').should('be.visible')
    cy.findByText('Other actions to consider').should('be.visible')
  }
})
