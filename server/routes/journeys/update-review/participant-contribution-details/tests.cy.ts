import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-review/participant-contribution-details', () => {
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getName = () => cy.findByRole('textbox', { name: /What’s the participant’s name\?/ })
  const getRole = () => cy.findByRole('textbox', { name: /What’s their role\?/ })
  const getRadioYes = () => cy.findByRole('radio', { name: /yes/i })
  const getContribution = () =>
    cy.findByRole('textbox', { name: /What did they contribute to the review\? \(optional\)/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPostNewAttendeeSuccess')
    navigateToTestPage()
    cy.url().should('to.match', /\/participant-contribution-details$/)

    checkAxeAccessibility()
    validatePageContents()
    validateErrorMessage()

    proceedToNextScreen()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve added a new participant.').should('be.visible')
  })

  it('should handle patch failure', () => {
    cy.task('stubPostNewAttendeeFail')
    navigateToTestPage()
    cy.url().should('to.match', /\/participant-contribution-details$/)

    proceedToNextScreen()

    cy.findByText('Simulated Error for E2E testing').should('be.visible')
    cy.url().should('to.match', /\/participant-contribution-details$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550/reviews`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/reviews$/)
    cy.findByRole('link', { name: /update review/i }).click()
    cy.findByRole('button', { name: /Add another participant/i }).click()
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Update the participant and contribution details/ }).should('be.visible')

    getName().should('be.visible')
    getRole().should('be.visible')
    getRadioYes().should('exist')
    getContribution().should('exist')
    getContinueButton().should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/update-review$/)

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorMessage = () => {
    getName().clear()
    getRole().clear()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the participant’s name/i })
      .should('be.visible')
      .click()
    getName().should('be.focused')

    cy.findByRole('link', { name: /Enter the participant’s role/i })
      .should('be.visible')
      .click()
    getRole().should('be.focused')

    getName().clear().invoke('val', 'a'.repeat(101))
    getRole().clear().invoke('val', 'a'.repeat(51))
    getContribution().clear().invoke('val', 'a'.repeat(4001))
    getContinueButton().click()

    cy.findByRole('link', { name: /Participant’s name must be 100 characters or less/i })
      .should('be.visible')
      .click()
    getName().should('be.focused')
    cy.findByRole('link', { name: /Participant’s role must be 50 characters or less/i })
      .should('be.visible')
      .click()
    getRole().should('be.focused')
    cy.findByRole('link', { name: /Contribution must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getContribution().should('be.focused')
    cy.findAllByText('You have 1 character too many').should('have.length', 6)

    getName().should('have.value', 'a'.repeat(101))
    getRole().should('have.value', 'a'.repeat(51))
    getContribution().should('have.value', 'a'.repeat(4001))
  }

  const proceedToNextScreen = () => {
    getName().clear().type('John Smith', { delay: 0 })
    getRole().clear().type('a role', { delay: 0 })
    getRadioYes().click()
    getContribution().clear().type('a contrib', { delay: 0 })
    getContinueButton().click()
  }
})
