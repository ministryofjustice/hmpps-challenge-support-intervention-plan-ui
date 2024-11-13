import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan/record-actions-progress', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getSummary = () => cy.findByRole('textbox', { name: 'Record any actions or progress (optional)' })

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
    cy.url().should('to.match', /update-plan\/record-actions-progress$/)
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {
          identifiedNeed: 'foobar',
          intervention: 'barfoo',
          responsiblePerson: 'person',
          targetDate: '2024-07-24',
        },
      },
    })

    checkAxeAccessibility()

    validatePageContents()
    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /update-plan\/check-answers$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('button', { name: /Add another identified need/i }).click()
    cy.visit(`${uuid}/update-plan/record-actions-progress`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Record any actions or progress (optional)' }).should('be.visible')
    cy.title().should('equal', 'Record any actions or progress - Update plan - DPS')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /intervention-details$/)

    getSummary().should('be.visible')

    getSummary().clear().type('a'.repeat(2999), { delay: 0 })
    cy.contains(/you have [0-9,]+ characters? remaining/i).should('not.be.visible')
    getSummary().clear().type('a'.repeat(3000), { delay: 0 })
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
  }

  const validateErrorMessagesTextInputTooLong = () => {
    getSummary().clear()

    getSummary().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Actions and progress must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getSummary().should('be.focused')
    getSummary().should('have.value', 'a'.repeat(4001))
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
