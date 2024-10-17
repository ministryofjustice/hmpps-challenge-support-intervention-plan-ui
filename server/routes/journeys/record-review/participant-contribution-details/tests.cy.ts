import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-review/participant-contribution-details', () => {
  const uuid = uuidV4()

  const getName = () => cy.findByRole('textbox', { name: /What’s the participant’s name\?/ })
  const getRole = () => cy.findByRole('textbox', { name: /What’s their role\?/ })
  const getContribution = () =>
    cy.findByRole('textbox', { name: /What did they contribute to the review\? \(optional\)/ })

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  const resetInputs = () => {
    getName().clear()
    getRole().clear()
    getContribution().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/participants-summary$/)
    checkAxeAccessibility()

    cy.findByText(/No participants recorded./).should('be.visible')

    proceedToAddAttendee('Add participant')
    checkAxeAccessibility()

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessagesTextInputTooLong()
    validateRadios()

    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /\/participants-summary$/)

    cy.get('a[href*="participant-contribution-details/1#name"]').first().click()
    verifyDetailsAreRestoredFromJourney()

    cy.visit(`${uuid}/record-review/participant-contribution-details/10`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('be.visible')
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Participant and contribution details/ }).should('be.visible')

    cy.findByRole('heading', { name: /What’s the participant’s name\?/ }).should('be.visible')

    getName().should('be.visible')
    cy.findByText('For example, the prisoner or a staff member supporting the prisoner.').should('be.visible')
    cy.findByRole('heading', { name: /What’s their role\?/ }).should('be.visible')
    getRole().should('be.visible')
    cy.findByText(/Did this participant attend the review meeting in person\?/).should('be.visible')
    cy.findByRole('radio', { name: /yes/i }).should('exist')
    cy.findByRole('heading', { name: /What did they contribute to the review\? \(optional\)/ }).should('be.visible')
    getContribution().should('exist')

    getContinueButton().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the participant’s name/i })
      .should('be.visible')
      .click()

    getName().should('be.focused')
    cy.findByRole('link', { name: /Enter the participant’s role/i })
      .should('be.visible')
      .click()
    getRole().should('be.focused')
    cy.findByRole('link', { name: /Select if the participant attended the review meeting in person or not/i })
      .should('be.visible')
      .click()
    cy.findByRole('radio', { name: /yes/i }).should('be.focused')

    cy.get('.govuk-error-summary a').should('have.length', 3)
    cy.findAllByText('Enter the participant’s name').should('have.length', 2)
    cy.findAllByText('Enter the participant’s role').should('have.length', 2)
    cy.findAllByText('Select if the participant attended the review meeting in person or not').should('have.length', 2)
  }

  const validateRadios = () => {
    resetInputs()
    cy.findByRole('radio', { name: /yes/i }).click()
    getContinueButton().click()
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')

    cy.findByRole('radio', { name: /no/i }).click()
    getContinueButton().click()
    cy.findByRole('radio', { name: /no/i }).should('be.checked')
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getName().clear().invoke('val', 'a'.repeat(101))
    getContinueButton().click()
    cy.findAllByText('Participant’s name must be 100 characters or less').should('have.length', 2)
    getName().should('have.value', 'a'.repeat(101))

    getRole().clear().invoke('val', 'a'.repeat(51))
    getContinueButton().click()
    cy.findAllByText('Participant’s role must be 50 characters or less').should('have.length', 2)
    getRole().should('have.value', 'a'.repeat(51))

    getContribution().clear().invoke('val', 'a'.repeat(4001))
    getContinueButton().click()
    cy.findAllByText('Contribution must be 4,000 characters or less').should('have.length', 2)
    cy.findAllByText('You have 1 character too many').should('have.length', 6)
    getContribution().should('have.value', 'a'.repeat(4001))
  }

  const completeInputs = () => {
    getName().clear().type('John Smith', { delay: 0 })
    getRole().clear().type('a role', { delay: 0 })
    getContribution().clear().type('a contrib', { delay: 0 })
    cy.findByRole('radio', { name: /yes/i }).click()
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    getName().should('have.value', 'John Smith')
    getRole().should('have.value', 'a role')
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    getContribution().should('have.value', 'a contrib')
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)
    cy.url().should('to.match', /\/record-review$/)
    cy.findByRole('link', { name: /Participants and contributions/i }).click()
  }

  const proceedToAddAttendee = (buttonName: string) => {
    cy.findByRole('button', { name: buttonName }).click()
    cy.url().should('to.match', /\/participant-contribution-details\/1$/)
  }
})
