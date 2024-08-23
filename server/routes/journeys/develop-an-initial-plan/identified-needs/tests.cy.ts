import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { Plan } from '../../../../@types/express'

context('test /develop-an-initial-plan/identified-needs', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessPlanPending')
  })

  it('should test identified-needs with no needs', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents(false)
  })

  it('should test identified-needs with needs', () => {
    navigateToTestPage([
      {
        closedDate: '2024-08-01',
        createdDate: '2024-08-01',
        identifiedNeed: 'a need goes here',
        intervention: 'some intervention',
        progression: 'progression goes here',
        responsiblePerson: 'test stafferson',
        targetDate: '2024-08-01',
      },
    ])
    checkAxeAccessibility()

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents(true)
  })

  const navigateToTestPage = (identifiedNeeds: Plan['identifiedNeeds'] = []) => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      prisoner: {
        firstName: 'TestName',
        lastName: 'User',
        cellLocation: '',
        prisonerNumber: '',
        prisonId: '',
      },
      plan: {
        identifiedNeeds,
      },
    })
    cy.visit(`${uuid}/develop-an-initial-plan/identified-needs`)
  }

  const validatePageContents = (withIdentifiedNeeds: boolean) => {
    cy.findByRole('heading', { name: /Identified needs for Testname User/ }).should('be.visible')

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    if (!withIdentifiedNeeds) {
      cy.findByText(/no identified needs recorded/i).should('be.visible')
      cy.findByRole('button', { name: /add identified need/i }).should('be.visible')
      cy.findByRole('button', { name: /add another identified need/i }).should('not.exist')
      cy.findByRole('button', { name: /continue/i }).should('not.exist')
    } else {
      cy.findByText(/no identified needs recorded/i).should('not.exist')
      cy.findByRole('button', { name: /add identified need/i }).should('not.exist')
      cy.findByRole('button', { name: /add another identified need/i }).should('be.visible')
      cy.findByRole('button', { name: /continue/i }).should('be.visible')
      cy.findByRole('heading', { name: /a need goes here/i }).should('be.visible')
      cy.findByText('01 August 2024').should('be.visible')
      cy.findByText(/identified need summary/i)
        .siblings()
        .findByText(/a need goes here/i)
        .should('be.visible')
      cy.findByText(/some intervention/i).should('be.visible')
      cy.findByText(/test stafferson/i).should('be.visible')
      cy.findByText(/progression goes here/).should('be.visible')
    }
  }
})
