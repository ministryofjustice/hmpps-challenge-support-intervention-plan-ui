import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { generateSaveTimestamp } from '../../../../utils/appendFieldUtils'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { IdentifiedNeed } from '../../../../@types/express'

context('test /update-planned-intervention/:uuid', () => {
  const uuid = uuidV4()

  const getInputTextbox = () => cy.findByRole('textbox', { name: 'Add information to the planned intervention' })
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/update-planned-intervention\/[a-zA-Z0-9-]+$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should try out lots of text existing already', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeeds: [
          {
            identifiedNeed: 'first need',
            responsiblePerson: 'test testerson',
            createdDate: '2024-03-01',
            targetDate: '2024-04-02',
            intervention: 'a'.repeat(3000),
            progression: 'progression done',
            identifiedNeedUuid: 'big-123',
          } as IdentifiedNeed,
        ],
      },
    })
    cy.url().should('to.match', /\/update-planned-intervention\/[a-zA-Z0-9-]+$/)

    cy.findAllByText(`You have ${1000 - generateSaveTimestamp('John Smith').length} characters remaining`).should(
      'be.visible',
    )
  })

  it('should handle API errors', () => {
    cy.task('stubPatchIdentifiedNeedFail')
    navigateToTestPage()

    getInputTextbox().clear().type('some text')
    getContinueButton().click()

    cy.url().should('to.match', /\/update-planned-intervention\/[a-zA-Z0-9-]+$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/identified-needs$/)
    cy.visit(`${uuid}/update-plan/update-planned-intervention/big-123`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Add information to the planned intervention' }).should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.title().should('equal', 'Planned intervention - Update a Plan - DPS')
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update on the planned intervention/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Update to the planned intervention must be [0-9,]+ characters or less/i,
    })
      .should('be.visible')
      .click()
    cy.findAllByText(/You have [0-9,]+ characters too many/)
      .filter(':visible')
      .should('have.length.of.at.least', 1)
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('  ')
    getContinueButton().click()
    cy.findByRole('link', { name: /Enter an update on the planned intervention/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the identified needs information.').should('be.visible')
  }
})
