import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'
import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /record-decision/check-answers', () => {
  let uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessPlanPending')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubDecisionOutcomeType')
    cy.task('stubPutDecision')
    uuid = uuidV4()
  })

  it('should show interstitial page with details of current decision', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    cy.url().should('to.match', /\/check-change-decision$/)
    cy.title().should(
      'equal',
      'Are you sure you want to change the outcome of the CSIP investigation? - Change a CSIP investigation decision - DPS',
    )
    cy.findByRole('heading', { name: /Are you sure you want to change the outcome of the CSIP investigation?/ }).should(
      'be.visible',
    )

    cy.findByText(
      `Changing the outcome will replace all of the following information in the CSIP investigation decision for Tes'name User. This should not be used just because a prisoner has transferred.`,
    ).should('be.visible')

    cy.contains('dt', 'Signed off by').next().should('include.text', `SignerRole1`)

    cy.contains('dt', 'Outcome').next().should('include.text', `No further action`)

    cy.contains('dt', 'Reasons for decision').next().should('include.text', `<script>alert('xss-conclusion');</script>`)

    cy.contains('dt', 'Comments on next steps')
      .next()
      .should('include.text', `<script>alert('xss-nextSteps');</script>`)

    cy.contains('dt', 'Additional information')
      .next()
      .should('include.text', `<script>alert('xss-actionOther');</script>`)

    continueToConfirmation()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`)

    cy.visit(`${uuid}/check-change-decision`)

    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          decisionAndActions: {
            signedOffByRole: { code: 'A', description: 'SignerRole1' },
            outcome: { code: 'NFA', description: 'No further action' },
            conclusion: `<script>alert('xss-conclusion');</script>`,
            nextSteps: `<script>alert('xss-nextSteps');</script>`,
            actionOther: `<script>alert('xss-actionOther');</script>`,
          },
        },
      },
    })
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Yes, change outcome and record new decision/i }).click()
    cy.url().should('to.match', /\/change-decision$/)
  }
})
