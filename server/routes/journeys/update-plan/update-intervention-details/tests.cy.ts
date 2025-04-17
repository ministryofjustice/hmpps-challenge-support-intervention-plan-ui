import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan/update-intervention-details', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getResponsiblePerson = () => cy.findByRole('textbox', { name: 'Who’s responsible for taking action?' })
  const getTargetDate = () => cy.findByRole('textbox', { name: 'What’s the target date for progress?' })

  const resetInputs = () => {
    getResponsiblePerson().clear()
    getTargetDate().clear()
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordSuccessCsipOpen')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchIdentifiedNeedSuccess')
    navigateToTestPage()

    cy.url().should('to.match', /update-intervention-details\/[a-zA-Z0-9-]*#responsiblePerson/i)

    checkAxeAccessibility()

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessagesTextInputTooLong()
    validateErrorMessagesDate()

    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the identified needs information.').should('be.visible')
  })

  it('should wrap very long identified need text', () => {
    navigateToTestPage()

    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeeds: [
          {
            identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0003',
            identifiedNeed: 'longtextwithnospaces'.repeat(100),
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

    cy.visit(`${uuid}/update-plan/update-intervention-details/a0000000-f7b1-4c56-bec8-69e390eb0003`)
    checkAxeAccessibility()

    cy.get('.break-word').should('have.length', 1).invoke('width').should('be.lte', 750)
  })

  it('should handle API errors', () => {
    cy.task('stubPatchIdentifiedNeedFail')
    navigateToTestPage()
    completeInputs()
    getContinueButton().click()

    cy.url().should('to.match', /update-intervention-details\/[a-zA-Z0-9-]*#responsiblePerson/i)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('link', { name: `Change the person responsible (first need)` }).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Add information to the planned intervention - Update plan - DPS')
    cy.findByRole('heading', { name: 'Intervention details' }).should('be.visible')
    cy.findByText('Identified need summary:').should('be.visible')
    cy.findByText('first need').should('be.visible')

    getResponsiblePerson().should('be.visible').and('have.value', 'test testerson')
    getTargetDate().should('be.visible').and('have.value', '2/4/2024')
    getContinueButton().should('be.visible')

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the name of the person responsible for taking action/i })
      .should('be.visible')
      .click()
    getResponsiblePerson().should('be.focused')
    cy.findAllByText('Enter the name of the person responsible for taking action').should('have.length', 2)

    cy.findByRole('link', { name: /Enter the target date/i })
      .should('be.visible')
      .click()
    getTargetDate().should('be.focused')
    cy.findAllByText('Enter the target date').should('have.length', 2)

    cy.pageCheckCharacterThresholdMessage(getResponsiblePerson(), 100)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getResponsiblePerson().type('a'.repeat(101), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Name of the person responsible for taking action must be 100 characters or less/i })
      .should('be.visible')
      .click()
    getResponsiblePerson().should('be.focused')
    getResponsiblePerson().should('have.value', 'a'.repeat(101))
  }
  const validateErrorMessagesDate = () => {
    resetInputs()

    getTargetDate().type('27/13/2024', { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Target date must be a real date/i })
      .should('be.visible')
      .click()
    getTargetDate().should('be.focused')
    getTargetDate().should('have.value', '27/13/2024')
  }

  const completeInputs = () => {
    resetInputs()
    getResponsiblePerson().type('textarea input', { delay: 0 })
    getTargetDate().type('27/8/2024', { delay: 0 })
  }
})
