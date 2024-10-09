import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /screen/check-answers', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubScreeningOutcomeType')
    cy.task('stubPostSaferCustodyScreening')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    cy.url().should('to.match', /\/check-answers$/)
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

    continueToConfirmation()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`)
    cy.url().should('to.match', /\/screen$/)

    injectJourneyDataAndReload(uuid, {
      saferCustodyScreening: {
        outcomeType: { code: 'NFA', description: 'No further action' },
        reasonForDecision: `<script>alert('xss-conclusion');</script>`,
      },
    })

    cy.visit(`${uuid}/screen/check-answers`)
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Record outcome/i }).click()
    cy.url().should('to.match', /\/confirmation/)
  }
})
