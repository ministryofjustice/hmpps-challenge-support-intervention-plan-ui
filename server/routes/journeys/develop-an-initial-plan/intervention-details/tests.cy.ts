import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /develop-an-initial-plan/intervention-details', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`
  const PAGE_URL = `${uuid}/develop-an-initial-plan/intervention-details/1`

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
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out cases for editing saved Identified Need', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

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

    cy.visit(PAGE_URL)
    checkAxeAccessibility()

    cy.findByText('Identified need summary:').next().should('have.text', 'saved summary')
    getIntervention().should('have.value', 'Intervention')
    getResponsiblePerson().should('have.value', 'Person Name')
    getTargetDate().should('have.value', '1/8/2024')

    completeInputs()
    getContinueButton().click()

    cy.go('back')
    verifyDetailsAreRestoredFromJourney()
  })

  it('should show 404 error on invalid index', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(`${PAGE_URL}1`, { failOnStatusCode: false })

    cy.findByText('Page not found').should('be.visible')
    checkAxeAccessibility()
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })
    injectJourneyDataAndReload(uuid, {
      plan: {
        identifiedNeedSubJourney: {
          identifiedNeed: 'Help to manage alcohol issues',
        },
      },
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    validateErrorMessagesDate()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/record-actions-progress\/1$/)
    cy.go('back')

    verifyDetailsAreRestoredFromJourney()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Intervention details' }).should('be.visible')

    cy.findByText('Identified need summary:').should('be.visible')

    cy.findByText('Develop an initial plan').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /summarise-identified-need\/1$/)

    getIntervention().should('be.visible')

    getResponsiblePerson().should('be.visible')

    cy.findByRole('textbox', { name: 'Who’s responsible for taking action?' }).should('be.visible')

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

    cy.pageCheckCharacterThresholdMessage(getIntervention(), 4000)
    cy.pageCheckCharacterThresholdMessage(getResponsiblePerson(), 100)
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
    getTargetDate().should('have.value', '27/8/2024')
    getResponsiblePerson().should('have.value', 'textarea input')
  }
})
