import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /referral/proactive-or-reactive', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/proactive-or-reactive`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getIsProactiveReferral = () => cy.findByRole('radio', { name: 'Proactive' })
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/details$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByText('Make a CSIP referral').should('be.visible')

    getIsProactiveReferral().should('exist')
    cy.findByRole('radio', { name: 'Reactive' }).should('exist')

    cy.findByText('This referral is preventative and based on a raised risk of an incident occurring.').should(
      'be.visible',
    )
    cy.findByText('This referral is being made in response to an incident.').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /area-of-work$/)
  }

  const validateErrorsMandatory = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select if this referral is proactive or reactive/i })
      .should('be.visible')
      .click()
    getIsProactiveReferral().should('be.focused')
    cy.findAllByText('Select if this referral is proactive or reactive').should('have.length', 2)
  }

  const completeInputs = () => {
    getIsProactiveReferral().click()
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getIsProactiveReferral().should('be.checked')
  }
})
