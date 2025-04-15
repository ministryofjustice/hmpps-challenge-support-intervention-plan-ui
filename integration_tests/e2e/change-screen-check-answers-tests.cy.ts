import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'
import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /change-screen/check-answers', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubScreeningOutcomeType')
    cy.task('stubPutSaferCustodyScreening')
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    cy.url().should('to.match', /\/check-answers$/)
    cy.title().should(
      'equal',
      'Check your answers before recording the screening outcome - Change CSIP screening outcome - DPS',
    )

    cy.findByText('Change CSIP referral screening').should('be.visible')

    cy.findByRole('heading', { name: /Check your answers before recording the screening outcome/ }).should('be.visible')

    cy.contains('dt', 'Screening outcome').next().should('include.text', `No further action`)
    cy.findByRole('link', { name: /change the screening outcome/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /screen#outcomeType$/)

    cy.findByRole('radio', { name: /Another option/ }).click()
    cy.findByRole('button', { name: /Continue/i }).click()

    cy.contains('dt', 'Screening outcome').next().should('include.text', `Another option`)

    cy.contains('dt', 'Reasons for decision').next().should('include.text', `<script>alert('xss-conclusion');</script>`)
    cy.findByRole('link', { name: /change the description of the reasons for the decision/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /screen#reasonForDecision$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Reasons for decision').next().should('include.text', `new text`)

    cy.findByRole('button', { name: /Record outcome/i }).click()
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    cy.findByText('You’ve changed the screening outcome.').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/change-screen/start`)

    injectJourneyDataAndReload(uuid, {
      saferCustodyScreening: {
        outcomeType: { code: 'NFA', description: 'No further action' },
        reasonForDecision: `<script>alert('xss-conclusion');</script>`,
      },
    })

    cy.visit(`${uuid}/change-screen/check-answers`)
  }
})
