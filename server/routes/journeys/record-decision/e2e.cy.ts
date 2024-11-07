import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubDecisionOutcomeType')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubPutDecisionSuccess')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessAwaitingDecision')
  })

  it('happy path', () => {
    signinAndStart()

    prisonerProfileShouldDisplay()

    fillInSignOff()
    fillInConclusion()
    fillInNextSteps()
    fillInAdditionalInformation()
    reviewCheckAnswersConfirm()
  })

  const fillInSignOff = () => {
    checkAxeAccessibility()
    cy.findByRole('radio', { name: /SignerRole2/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
  }

  const fillInConclusion = () => {
    checkAxeAccessibility()
    cy.findByRole('radio', { name: /Another option/i }).click()
    cy.findByRole('textbox', { name: /Describe the reasons for the decision/i }).type('some reasons go here')
    cy.findByRole('button', { name: /continue/i }).click()
  }

  const fillInNextSteps = () => {
    checkAxeAccessibility()
    cy.findByRole('textbox', { name: /Add any comments on next steps \(optional\)/i }).type('some comments here!')
    cy.findByRole('button', { name: /continue/i }).click()
  }

  const fillInAdditionalInformation = () => {
    checkAxeAccessibility()
    cy.findByRole('textbox', { name: /Add additional information \(optional\)/i }).type('additional info goes here!')
    cy.findByRole('button', { name: /continue/i }).click()
  }

  const reviewCheckAnswersConfirm = () => {
    checkAxeAccessibility()
    cy.contains('dt', 'Signed off by').next().should('include.text', 'SignerRole2')
    cy.contains('dt', 'Outcome').next().should('include.text', 'Another option')
    cy.contains('dt', 'Reasons for decision').next().should('include.text', 'some reasons go here')
    cy.contains('dt', 'Comments on next steps').next().should('include.text', 'some comments here!')
    cy.contains('dt', 'Additional information').next().should('include.text', 'additional info goes here!')
    cy.findByRole('button', { name: /Confirm and record decision/i }).click()

    cy.url().should('include', '/confirmation')
    checkAxeAccessibility()
    cy.findByRole('heading', { name: /CSIP investigation decision recorded/i })
      .should('be.visible')
      .next()
      .should('include.text', 'Status: Awaiting decision')

    cy.go('back')
    // There is nothing to test or wait on when going back here - the entire redirection is handled in the express middleware, so we just wait for a second to ensure
    // that we arent just immediately testing that the same url is there, and then that the state handling has redirected us back to confirmation
    cy.wait(1000)
    cy.url().should('include', '/confirmation')
  }

  const signinAndStart = () => {
    cy.signIn()
    cy.visit('csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/investigation')
    cy.findAllByText('Record decision').first().click()
  }

  const prisonerProfileShouldDisplay = () => {
    cy.findByRole('img', { name: /Image of User, Testname/ }).should('be.visible')
    cy.findByRole('link', { name: /User, Testname/ }).should('be.visible')
    cy.findByText('A1111AA').should('be.visible')
    cy.findByText('02/02/1932').should('be.visible')
    cy.findByText('HMP Kirkham').should('be.visible')
    cy.findByText('A-1-1').should('be.visible')
    cy.findByText('On remand').should('be.visible')
  }
})
