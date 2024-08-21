import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/safer-custody', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/safer-custody`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getIsSaferCustodyTeamInformed = () => cy.findByRole('radio', { name: 'Yes' })
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
    injectJourneyDataAndReload(uuid, {})

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/additional-information$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByText('Make a CSIP referral').should('be.visible')

    cy.findByRole('radio', { name: 'Yes' }).should('exist')
    cy.findByRole('radio', { name: 'No' }).should('exist')
    cy.findByRole('radio', { name: 'I don’t know' }).should('exist')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /contributory-factors-comments$/)
  }

  const validateErrorsMandatory = () => {
    getContinueButton().click()

    cy.findByRole('link', {
      name: /Select if the Safer Custody team is already aware of this referral or not, or select ‘I don’t know’/i,
    })
      .should('be.visible')
      .click()
    getIsSaferCustodyTeamInformed().should('be.focused')
    cy.findAllByText(
      'Select if the Safer Custody team is already aware of this referral or not, or select ‘I don’t know’',
    ).should('have.length', 2)
  }

  const completeInputs = () => {
    getIsSaferCustodyTeamInformed().click()
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getIsSaferCustodyTeamInformed().should('be.checked')
  }
})
