import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'

context('test /update-plan/summarise-identified-need', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getSummary = () => cy.findByRole('textbox', { name: 'Summarise the identified need' })

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
    cy.url().should('to.match', /update-plan\/summarise-identified-need$/)
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {},
      },
    })

    checkAxeAccessibility()

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /update-plan\/intervention-details$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('button', { name: /Add another identified need/i }).click()
    cy.visit(`${uuid}/update-plan/summarise-identified-need`)
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Summarise the identified need - Update plan - DPS')
    cy.findByRole('heading', { name: 'Summarise the identified need' }).should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /..\/identified-needs$/)

    getSummary().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    getSummary().clear()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter a summary of the identified need/i })
      .should('be.visible')
      .click()
    getSummary().should('be.focused')
    cy.findAllByText('Enter a summary of the identified need').should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    getSummary().clear()

    getSummary().type('a'.repeat(1001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Summary of the identified need must be 1,000 characters or less/i })
      .should('be.visible')
      .click()
    getSummary().should('be.focused')
    getSummary().should('have.value', 'a'.repeat(1001))

    cy.pageCheckCharacterThresholdMessage(getSummary(), 1000)
  }

  const completeInputs = () => {
    getSummary().clear()

    getSummary().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getSummary().should('have.value', 'textarea input')
  }
})
