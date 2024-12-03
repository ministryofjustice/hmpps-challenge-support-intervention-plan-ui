import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-decision/check-answers', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubDecisionOutcomeType')
    cy.task('stubPutDecision')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    cy.url().should('to.match', /\/check-answers$/)
    cy.title().should(
      'equal',
      'Check your answers before recording the investigation decision - Record a CSIP investigation decision - DPS',
    )
    cy.findByRole('heading', { name: /Check your answers before recording the investigation decision/ }).should(
      'be.visible',
    )

    cy.contains('dt', 'Signed off by').next().should('include.text', `SignerRole1`)
    cy.findByRole('link', { name: /change who’s signing off on the decision/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /record-decision$/)
    cy.findByRole('radio', { name: /SignerRole2/ }).click()
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Signed off by').next().should('include.text', `SignerRole2`)

    cy.contains('dt', 'Outcome').next().should('include.text', `No further action`)
    cy.findByRole('link', { name: /change the outcome of the investigation/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /conclusion#outcome$/)
    cy.findByRole('radio', { name: /Another option/ }).click()
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Outcome').next().should('include.text', `Another option`)

    cy.contains('dt', 'Reasons for decision').next().should('include.text', `<script>alert('xss-conclusion');</script>`)
    cy.findByRole('link', { name: /change the description of the reasons for the decision/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /conclusion#conclusion$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Reasons for decision').next().should('include.text', 'new text')

    cy.contains('dt', 'Comments on next steps')
      .next()
      .should('include.text', `<script>alert('xss-nextSteps');</script>`)
    cy.findByRole('link', { name: /change the comments on next steps/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /next-steps(#[A-z]+)?$/)
    cy.findByRole('textbox').clear()
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Comments on next steps').next().should('include.text', 'Not provided')

    cy.contains('dt', 'Additional information')
      .next()
      .should('include.text', `<script>alert('xss-actionOther');</script>`)
    cy.findByRole('link', { name: /change the additional information/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /additional-information(#[A-z]+)?$/)
    cy.findByRole('textbox').clear()
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Additional information').next().should('include.text', 'Not provided')

    continueToConfirmation()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, { isCheckAnswers: false, journeyCompleted: false })
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start`)
    cy.url().should('to.match', /\/record-decision$/)

    injectJourneyDataAndReload(uuid, {
      decisionAndActions: {
        signedOffByRole: { code: 'A', description: 'SignerRole1' },
        outcome: { code: 'NFA', description: 'No further action' },
        conclusion: `<script>alert('xss-conclusion');</script>`,
        nextSteps: `<script>alert('xss-nextSteps');</script>`,
        actionOther: `<script>alert('xss-actionOther');</script>`,
      },
    })

    cy.visit(`${uuid}/record-decision/check-answers`)
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and record decision/i }).click()
    cy.url().should('to.match', /\/confirmation(#[A-z]+)?$/)
  }
})
