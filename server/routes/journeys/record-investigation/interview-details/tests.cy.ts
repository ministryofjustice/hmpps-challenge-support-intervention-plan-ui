import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/interview-details', () => {
  const uuid = uuidV4()

  const getInterviewDate = () => cy.findByRole('textbox', { name: /Interview date/ })
  const getIntervieweeName = () => cy.findByRole('textbox', { name: /Interviewee name/ })
  const getIntervieweeRole = () => cy.findByRole('radio', { name: /Role1/ })
  const getInterviewText = () => cy.findByRole('textbox', { name: /Comments \(optional\)/ })

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  const resetInputs = () => {
    getInterviewDate().clear()
    getIntervieweeName().clear()
    getInterviewText().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubIntervieweeRoles')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/interviews-summary$/)
    checkAxeAccessibility()

    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByText(/No interview details recorded./).should('be.visible')

    proceedToAddInterview('Add interview')
    cy.title().should('equal', 'Interview details - Record a CSIP investigation - DPS')

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessageInterviewDate()
    validateErrorMessagesTextInputTooLong()
    validateRadios()

    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /\/interviews-summary$/)

    cy.get('a[href*="interview-details/1#interviewee"]').first().click()
    verifyDetailsAreRestoredFromJourney()

    cy.visit(`${uuid}/record-investigation/interview-details/10`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('be.visible')
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Interview details/ }).should('be.visible')

    cy.findByRole('heading', { name: /Interviewee name/ }).should('be.visible')
    getIntervieweeName().should('be.visible')
    cy.findByRole('heading', { name: /Interview date/ }).should('be.visible')
    getInterviewDate().should('be.visible')
    cy.findByRole('heading', { name: /Comments \(optional\)/ }).should('be.visible')
    getInterviewText().should('be.visible')
    cy.findByRole('group', { name: /How was the interviewee involved\?/ }).should('be.visible')

    getIntervieweeRole().should('exist')
    cy.findByRole('radio', { name: /Role2/ }).should('exist')

    getContinueButton().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()
    cy.title().should('equal', 'Error: Interview details - Record a CSIP investigation - DPS')

    cy.findByRole('link', { name: /Enter the interviewee’s name/i })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: /Interviewee name/i }).should('be.focused')
    cy.findByRole('link', { name: /Enter the date of the interview/i })
      .should('be.visible')
      .click()
    getInterviewDate().should('be.focused')
    cy.findByRole('link', { name: /Select how the interviewee was involved/i })
      .should('be.visible')
      .click()
    getIntervieweeRole().should('be.focused')

    cy.get('.govuk-error-summary a').should('have.length', 3)
    cy.findAllByText('Enter the interviewee’s name').should('have.length', 2)
    cy.findAllByText('Enter the date of the interview').should('have.length', 2)
    cy.findAllByText('Select how the interviewee was involved').should('have.length', 2)
  }

  const validateErrorMessageInterviewDate = () => {
    resetInputs()
    getInterviewDate().clear().type('31/2/2024', { delay: 0 })
    getContinueButton().click()

    cy.findAllByText('Date of the interview must be a real date').should('have.length', 2)
    getInterviewDate().should('have.value', '31/2/2024')

    getInterviewDate().clear().type('01/01/2124', { delay: 0 })
    getContinueButton().click()

    cy.findAllByText('Date of the interview must be today or in the past').should('have.length', 2)
    getInterviewDate().should('have.value', '1/1/2124')
  }

  const validateRadios = () => {
    resetInputs()
    getIntervieweeRole().click()
    getContinueButton().click()

    cy.findByRole('radio', { name: /Role1/ }).should('be.checked')
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()
    getIntervieweeName().clear().invoke('val', 'a'.repeat(101))
    getContinueButton().click()

    cy.findAllByText('Interviewee’s name must be 100 characters or less').should('have.length', 2)
    getIntervieweeName().should('have.value', 'a'.repeat(101))

    getInterviewText().clear().invoke('val', 'a'.repeat(4001))
    getContinueButton().click()

    cy.findAllByText('Comments must be 4,000 characters or less').should('have.length', 2)
    cy.findAllByText('You have 1 character too many').should('have.length', 4)
    getInterviewText().should('have.value', 'a'.repeat(4001))
  }

  const completeInputs = () => {
    getInterviewDate().clear().type('01/01/2021', { delay: 0 })
    getIntervieweeName().clear().type('John Smith', { delay: 0 })
    getInterviewText().clear().type('Interviewee comment', { delay: 0 })
    getIntervieweeRole().click()
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    getIntervieweeName().should('have.value', 'John Smith')
    getInterviewDate().should('have.value', '1/1/2021')
    getIntervieweeRole().should('be.checked')
    getInterviewText().should('have.value', 'Interviewee comment')
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /\/record-investigation$/)
    cy.findByRole('link', { name: /Interview details/i }).click()
  }

  const proceedToAddInterview = (buttonName: string) => {
    cy.findByRole('button', { name: buttonName }).click()
    cy.url().should('to.match', /\/interview-details\/1$/)
  }
})
