import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { generateSaveTimestamp } from '../../../../utils/appendFieldUtils'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-decision/conclusion', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Add information about the reasons for the decision' })
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessPlanPending')
  })

  it('should try out all cases', () => {
    cy.task('stubPutDecisionSuccess')
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/conclusion$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should try out lots of text existing already', () => {
    cy.task('stubPutDecisionSuccess')
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          decisionAndActions: {
            conclusion: 'a'.repeat(3000),
          },
        },
      },
    })
    cy.url().should('to.match', /\/conclusion$/)

    cy.findAllByText(`You have ${1000 - generateSaveTimestamp('John Smith').length} characters remaining`).should(
      'be.visible',
    )
  })

  it('should handle API errors', () => {
    cy.task('stubPutDecisionFail')
    navigateToTestPage()

    getInputTextbox().clear().type('some text')
    getContinueButton().click()

    cy.url().should('to.match', /\/conclusion$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/update-decision$/)
    cy.visit(`${uuid}/update-decision/conclusion`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Add information about the reasons for the decision' }).should('be.visible')
    cy.findByText('dec-conc').should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText(/Include the name and role of the staff member signing off on the decision/i).should('not.exist')
    cy.findAllByRole('radio').should('have.length', 0)
    cy.title().should('equal', 'Conclusion - Update a CSIP investigation decision - DPS')
    cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', `../update-decision`)
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update on the reasons for the decision/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Update to the description must be [0-9,]+ characters or less/i,
    })
      .should('be.visible')
      .click()
    cy.findAllByText(/You have [0-9,]+ characters too many/)
      .filter(':visible')
      .should('have.length.of.at.least', 1)
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('  ')
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update on the reasons for the decision/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the information about the investigation decision.').should('be.visible')
  }
})
