import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/reasons', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/reasons`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getKnownReasons = (type: string) =>
    cy.findByRole('textbox', { name: `What reasons have been given for the ${type}?` })
  const getKnownReasonsDetails = (type: string) =>
    type === 'behaviour'
      ? cy.findByText(
          'Include any reasons the prisoner has given about why the behaviour has occurred. You can also include reasons reported by other people.',
        )
      : cy.findByText(
          'Include any reasons the prisoner has given about why the incident occurred. You can also include reasons reported by other people.',
        )

  const resetInputs = (type: string) => {
    getKnownReasons(type).clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases - proactive', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    injectJourneyDataAndReload(uuid, { referral: { isProactiveReferral: true } })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents('behaviour')

    validateErrorsMandatory('behaviour')

    validateErrorMessagesTextInputTooLong('behaviour')

    completeInputs('behaviour')

    getContinueButton().click()
    cy.url().should('to.match', /\/contributory-factors$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney('behaviour')
  })

  it('should try out all cases - reactive', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    injectJourneyDataAndReload(uuid, { referral: { isProactiveReferral: false } })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents('incident')

    validateErrorsMandatory('incident')

    validateErrorMessagesTextInputTooLong('incident')

    completeInputs('incident')

    getContinueButton().click()
    cy.url().should('to.match', /\/contributory-factors$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney('incident')
  })

  const validatePageContents = (type: string) => {
    cy.title().should('equal', `What reasons have been given for the ${type}? - Make a CSIP referral - DPS`)
    cy.findByText('Make a CSIP referral').should('be.visible')

    cy.findByRole('heading', { name: `What reasons have been given for the ${type}?` })

    getKnownReasonsDetails(type).should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /description$/)
  }

  const validateErrorsMandatory = (type: string) => {
    resetInputs(type)
    getContinueButton().click()

    cy.findByRole('link', { name: `Enter the reasons given for the ${type}` })
      .should('be.visible')
      .click()
    getKnownReasons(type).should('be.focused')
    cy.findAllByText(`Enter the reasons given for the ${type}`).should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = (type: string) => {
    resetInputs(type)

    getKnownReasons(type).type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Reasons must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getKnownReasons(type).should('be.focused')
    getKnownReasons(type).should('have.value', 'a'.repeat(4001))

    cy.pageCheckCharacterThresholdMessage(getKnownReasons(type), 4000)
  }

  const completeInputs = (type: string) => {
    resetInputs(type)

    getKnownReasons(type).type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = (type: string) => {
    cy.reload()

    getKnownReasons(type).should('have.value', 'textarea input')
  }
})
