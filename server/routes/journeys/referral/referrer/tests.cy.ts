import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/referrer', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/referrer`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getReferredBy = () => cy.findByRole('textbox', { name: 'What’s their name?' })
  const getAreaOfWork = () => cy.findByRole('combobox', { name: 'Which area do they work in?' })

  const resetInputs = () => {
    getReferredBy().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    injectJourneyDataAndReload(uuid, {})

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/proactive-or-reactive$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Referrer details' }).should('be.visible')

    cy.findByText('Make a CSIP referral').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /on-behalf-of$/)

    cy.findByRole('textbox', { name: 'What’s their name?' }).should('be.visible')

    cy.findByText('If the referrer is a prisoner, select ‘Other’.').should('be.visible')

    getAreaOfWork().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the referrer’s name/i })
      .should('be.visible')
      .click()
    getReferredBy().should('be.focused').should('have.text', '')
    cy.findAllByText('Enter the referrer’s name').should('have.length', 2)

    cy.findByRole('link', { name: /Select the referrer’s area of work/i })
      .should('be.visible')
      .click()
    getAreaOfWork().should('be.focused')
    cy.findAllByText('Select the referrer’s area of work').should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getReferredBy().type('a'.repeat(241), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Referrer’s name must be 240 characters or less/i })
      .should('be.visible')
      .click()
    getReferredBy().should('be.focused')
    getReferredBy().should('have.value', 'a'.repeat(241))
  }

  const completeInputs = () => {
    resetInputs()

    getReferredBy().type('textarea input', { delay: 0 })

    getAreaOfWork().select('AreaA')
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getReferredBy().should('have.value', 'textarea input')

    getAreaOfWork().should('have.value', 'A')
  }
})
