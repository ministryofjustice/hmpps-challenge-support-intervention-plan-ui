import { v4 as uuidV4 } from 'uuid'
import { formatDate, startOfTomorrow } from 'date-fns'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-plan/next-review-date', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: /when will you next review the plan with/i })
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchPlanSuccess')
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/next-review-date$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should handle API errors', () => {
    cy.task('stubPatchPlanFail')
    navigateToTestPage()

    getInputTextbox().clear().type(formatDate(startOfTomorrow(), 'dd/MM/yyyy'))
    getContinueButton().click()

    cy.url().should('to.match', /\/next-review-date$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/update-plan$/)
    cy.visit(`${uuid}/update-plan/next-review-date`)
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Change the date for the next CSIP review - Update plan - DPS')
    cy.findByRole('heading', { name: /change the date of the next csip review/i }).should('be.visible')
    cy.findByRole('heading', { name: /when will you next review the plan with/i }).should('be.visible')
    cy.findByDisplayValue('25/5/2024').should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText(/Help with setting a review date/i).should('not.exist')
    cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', `../update-plan`)
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter the date for the next review/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('01-01-2000')
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Next review date must be today or in the future/i,
    })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('  ')
    getContinueButton().click()
    cy.findByRole('link', { name: /Next review date must be a real date/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('35/13/2024')
    getContinueButton().click()
    cy.findByRole('link', { name: /Next review date must be a real date/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type(formatDate(startOfTomorrow(), 'dd/MM/yyyy'))
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the case management information.').should('be.visible')
  }
})
