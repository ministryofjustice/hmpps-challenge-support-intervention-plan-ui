import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-investigation/interview-details', () => {
  const uuid = uuidV4()

  const getInterviewDate = () => cy.findByRole('textbox', { name: /Interview date/ })
  const getIntervieweeName = () => cy.findByRole('textbox', { name: /Interviewee name/ })
  const getIntervieweeRole = () => cy.findByRole('radio', { name: /Role1/ })
  const getInterviewText = () => cy.findByRole('textbox', { name: /Comments \(optional\)/ })

  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordSuccessAwaitingDecision')
  })

  it('should try out add new interview', () => {
    cy.task('stubPostInterviewSuccess')
    navigateToTestPage(true)
    checkAxeAccessibility()

    cy.url().should('to.match', /\/interview-details\/3$/)

    validatePageContents(true)
    validateErrorMessage()
    proceedToNextScreen(true)
  })

  it('should try out update existing interview', () => {
    cy.task('stubPatchInterviewSuccess')
    navigateToTestPage(false)
    checkAxeAccessibility()

    cy.url().should('to.match', /\/interview-details\/2#interviewText$/)

    validatePageContents(false)
    proceedToNextScreen(false)
  })

  it('should handle API errors for adding interview', () => {
    cy.task('stubPostInterviewFail')
    navigateToTestPage(true)
    completeInputAndSubmit()
    cy.url().should('to.match', /\/interview-details\/3$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  it('should handle API errors for updating interview', () => {
    cy.task('stubPatchInterviewFail')
    navigateToTestPage(false)
    completeInputAndSubmit()
    cy.url().should('to.match', /\/interview-details\/2#interviewText$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = (newInterview: boolean) => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/update-investigation$/)

    if (newInterview) {
      cy.findByRole('button', { name: /Add another interview/i }).click()
    } else {
      cy.findByRole('link', {
        name: /Change the comments about the interview with Another Person \(Interview with Another Person\)/i,
      }).click()
    }
  }

  const validatePageContents = (newInterview: boolean) => {
    if (newInterview) {
      getIntervieweeName().should('have.value', '')
      getInterviewDate().should('have.value', '')
      getIntervieweeRole().should('not.be.checked')
      getInterviewText().should('have.value', '')
    } else {
      getIntervieweeName().should('have.value', 'Another Person')
      getInterviewDate().should('have.value', '29/12/2024')
      getIntervieweeRole().should('be.checked')
      getInterviewText().should('have.value', 'some text')
    }

    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorMessage = () => {
    getInterviewText().clear().invoke('val', 'a'.repeat(4001))
    getContinueButton().click()

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
    cy.findByRole('link', { name: /Comments must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getInterviewText().should('be.focused')
  }

  const completeInputAndSubmit = () => {
    getInterviewDate().clear().type('01/01/2021')
    getIntervieweeName().clear().type('John Smith')
    getInterviewText().clear().type('Interviewee comment')
    getIntervieweeRole().click()
    getContinueButton().click()
  }

  const proceedToNextScreen = (newInterview: boolean) => {
    completeInputAndSubmit()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    if (newInterview) {
      cy.findByText('You’ve added an interview.').should('be.visible')
    } else {
      cy.findByText('You’ve updated the interview details.').should('be.visible')
    }
  }
})
