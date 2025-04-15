import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'

context('test /develop-an-initial-plan/record-actions-progress', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Record any actions or progress (optional)' })
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

    cy.url().should('to.match', /\/record-actions-progress\/1$/)

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
            progression: 'saved progression',
          },
        ],
      },
    })
    cy.url().should('to.match', /\/record-actions-progress\/1$/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /identified-needs$/)
    getInputTextbox().should('have.value', 'saved progression')
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()

    verifySubmittedValueIsPersisted()
  })

  it('should show 404 error on invalid index', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/record-actions-progress\/1$/)

    cy.visit(`${uuid}/develop-an-initial-plan/record-actions-progress/99`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/develop-an-initial-plan$/)

    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {
          identifiedNeed: 'Some need',
          responsiblePerson: 'Person Name',
          intervention: 'Intervention plan',
          targetDate: '2024-08-01',
        },
      },
    })

    cy.visit(`${uuid}/develop-an-initial-plan/record-actions-progress/1`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Record any actions or progress \(optional\)/ }).should('be.visible')
    cy.findByText('Some need').should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /intervention-details\/1$/)
  }

  const validateErrorMessage = () => {
    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', { name: /Actions and progress must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    cy.findByRole('button', { name: 'Continue' }).click()
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.url().should('match', /identified-needs$/)
    cy.contains('dt', 'Actions and progress').next().should('include.text', "<script>alert('xss');</script>")
  }
})
