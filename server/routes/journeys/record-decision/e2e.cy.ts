import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('Record a decision journey', () => {
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

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.signIn()

    cy.visit('csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-decision/start', { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('happy path', () => {
    signinAndStart()

    prisonerProfileShouldDisplay()

    fillInSignOff()
    fillInConclusion()
    fillInNextSteps()
    fillInAdditionalInformation()
    reviewCheckAnswersConfirm()
    reviewChangeLinks()
    reivewConfirmation()
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
  }

  const reivewConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and record decision/i }).click()
    cy.url().should('include', '/confirmation')
    checkAxeAccessibility()
    cy.findByRole('heading', { name: /CSIP investigation decision recorded/i })
      .should('be.visible')
      .next()
      .should('include.text', 'Status: Awaiting decision')

    // Test that going back from confirmation automatically redirects us back to confirmation
    cy.go('back')
    // There is nothing to test or wait on when going back here - the entire redirection is handled in the express middleware, so we just wait for a second to ensure
    // that we arent just immediately testing before the navigation back has started, and then that the state handling has redirected us back to confirmation
    cy.wait(1000)
    cy.url().should('include', '/confirmation')
  }

  const reviewChangeLinks = () => {
    cy.findByRole('link', { name: /who’s signing off on the decision/i }).click()
    cy.url().should('to.match', /record-decision$/)
    cy.findByRole('radio', { name: /SignerRole1/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Signed off by').next().should('include.text', 'SignerRole1')

    cy.findByRole('link', { name: /change the outcome of the investigation/i }).click()
    cy.url().should('to.match', /conclusion#outcome$/)
    cy.findByRole('radio', { name: /No further action/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Outcome').next().should('include.text', 'No further action')

    cy.findByRole('link', { name: /change the description of the reasons for the decision/i }).click()
    cy.url().should('to.match', /conclusion#conclusion$/)
    cy.findByRole('textbox', { name: /Describe the reasons for the decision/i }).type('different reasons')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Reasons for decision').next().should('include.text', 'different reasons')

    cy.findByRole('link', { name: /change the comments on next steps/i }).click()
    cy.url().should('to.match', /next-steps$/)
    cy.findByRole('textbox', { name: /Add any comments on next steps \(optional\)/i }).type('next steps!')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Comments on next steps').next().should('include.text', 'next steps!')

    cy.findByRole('link', { name: /change the additional information/i }).click()
    cy.url().should('to.match', /additional-information$/)
    cy.findByRole('textbox', { name: /Add additional information \(optional\)/i }).type('different info')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Additional information').next().should('include.text', 'different info')
  }

  const signinAndStart = () => {
    cy.signIn()
    cy.visit('csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/investigation')
    cy.findAllByText('Record decision').first().click()
  }

  const prisonerProfileShouldDisplay = () => {
    cy.findByRole('img', { name: /Image of User, Tes'name/ }).should('be.visible')
    cy.findByRole('link', { name: /User, Tes'name/ }).should('be.visible')
    cy.findByText('A1111AA').should('be.visible')
    cy.findByText('02/02/1932').should('be.visible')
    cy.findByText('HMP Kirkham').should('be.visible')
    cy.findByText('A-1-1').should('be.visible')
    cy.findByText('On remand').should('be.visible')
  }
})
