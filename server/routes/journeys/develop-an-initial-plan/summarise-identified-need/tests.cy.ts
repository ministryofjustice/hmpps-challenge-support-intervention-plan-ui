import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /develop-an-initial-plan/summarise-identified-need', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Summarise the identified need' })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out cases for adding new Identified Need', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/summarise-identified-need\/1$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
  })

  it('should try out cases for editing saved Identified Need', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeeds: [
          {
            identifiedNeed: 'saved summary',
            responsiblePerson: 'Person Name',
            intervention: 'Intervention',
            createdDate: '2024-08-01',
            targetDate: '2024-08-01',
            closedDate: null,
            progression: null,
          },
        ],
      },
    })
    cy.url().should('to.match', /\/summarise-identified-need\/1$/)
    getInputTextbox().should('have.value', 'saved summary')
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()
    cy.url().should('match', /identified-needs$/)
    verifySubmittedValueIsPersisted()
  })

  it('should show 404 error on invalid index', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/summarise-identified-need\/1$/)

    cy.visit(`${uuid}/develop-an-initial-plan/summarise-identified-need/99`, { failOnStatusCode: false })
    cy.findByText('404').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/develop-an-initial-plan$/)
    cy.visit(`${uuid}/develop-an-initial-plan/summarise-identified-need/1`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Summarise the identified need/ }).should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /identified-needs$/)
  }

  const validateErrorMessage = () => {
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter a summary of the identified need/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type(' ')
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter a summary of the identified need/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('a'.repeat(1001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', { name: /Summary of the identified need must be 1,000 characters or less/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /intervention-details\/1$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }
})
