import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/contributory-factor-comment', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/code1-comment`

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getComment = () => cy.findByRole('textbox', { name: 'Add a comment on type factors (optional)' })

  const resetInputs = () => {
    getComment().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubContribFactors')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    injectJourneyDataAndReload(uuid, {
      referral: {
        contributoryFactors: [
          {
            factorType: { code: 'CODE1', description: 'Type' },
          },
        ],
      },
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /\/contributory-factors-comments$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'Add a comment on type factors - Make a CSIP referral - DPS')
    cy.findByText('Make a CSIP referral').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /contributory-factors-comments$/)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getComment().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Comment must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getComment().should('be.focused')
    getComment().should('have.value', 'a'.repeat(4001))
  }

  const completeInputs = () => {
    resetInputs()

    getComment().type('textarea input', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()
    getComment().should('have.value', 'textarea input')
  }
})
