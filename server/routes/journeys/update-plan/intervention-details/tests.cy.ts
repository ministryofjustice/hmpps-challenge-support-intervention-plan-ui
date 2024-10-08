import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-plan/intervention-details', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })
  const getIntervention = () =>
    cy.findByRole('textbox', { name: 'What’s the planned intervention for this identified need?' })
  const getResponsiblePerson = () => cy.findByRole('textbox', { name: 'Who’s responsible for taking action?' })
  const getTargetDate = () => cy.findByRole('textbox', { name: 'What’s the target date for progress?' })

  const resetInputs = () => {
    getIntervention().clear()
    getResponsiblePerson().clear()
    getTargetDate().clear()
  }

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
    cy.url().should('to.match', /update-plan\/intervention-details$/)
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {
          identifiedNeed: 'Help to manage alcohol issues',
        },
      },
    })

    checkAxeAccessibility()

    validatePageContents()
    validateErrorsMandatory()
    validateErrorMessagesTextInputTooLong()
    validateErrorMessagesDate()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /update-plan\/record-actions-progress$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`)
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('button', { name: /Add another identified need/i }).click()
    cy.visit(`${uuid}/update-plan/intervention-details`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Intervention details' }).should('be.visible')
    cy.findByText('Identified need summary:').should('be.visible')
    cy.findByText('Help to manage alcohol issues').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /summarise-identified-need$/)

    getIntervention().should('be.visible')
    getResponsiblePerson().should('be.visible')
    getTargetDate().should('be.visible')
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the planned intervention for the identified need/i })
      .should('be.visible')
      .click()
    getIntervention().should('be.focused')
    cy.findAllByText('Enter the planned intervention for the identified need').should('have.length', 2)

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
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getIntervention().type('a'.repeat(4001), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Planned intervention for the identified need must be 4,000 characters or less/i })
      .should('be.visible')
      .click()
    getIntervention().should('be.focused')
    getIntervention().should('have.value', 'a'.repeat(4001))

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

    getIntervention().type('textarea input', { delay: 0 })

    getResponsiblePerson().type('textarea input', { delay: 0 })

    getTargetDate().type('27/8/2024', { delay: 0 })
  }

  const verifyDetailsAreRestoredFromJourney = () => {
    cy.reload()

    getIntervention().should('have.value', 'textarea input')
    getTargetDate().should('have.value', '27/08/2024')
    getResponsiblePerson().should('have.value', 'textarea input')
  }
})
