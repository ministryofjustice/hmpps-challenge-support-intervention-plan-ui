import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /develop-an-initial-plan/delete-identified-need', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessPlanPending')
  })

  it('should test delete-identified-need', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    validatePageContents()

    testButtons()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      prisoner: {
        firstName: 'TestName',
        lastName: 'User',
        cellLocation: '',
        prisonerNumber: 'A1111AA',
        prisonId: '',
      },
      plan: {
        identifiedNeeds: [
          {
            closedDate: '2024-08-01',
            createdDate: '2024-08-01',
            identifiedNeed: 'a need goes here',
            intervention: 'some intervention',
            progression: 'progression goes here',
            responsiblePerson: 'test stafferson',
            targetDate: '2024-08-01',
          },
        ],
      },
    })
    cy.visit(`${uuid}/develop-an-initial-plan/delete-identified-need/1`)
  }

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^back/i }).should('be.visible')
    cy.findByRole('heading', { name: /are you sure you want to delete this identified need\?/i }).should('be.visible')

    cy.findByRole('button', { name: /yes, delete it/i }).should('be.visible')
    cy.findByRole('button', { name: /no, do not delete it/i }).should('be.visible')
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

  const testButtons = () => {
    cy.findByRole('button', { name: /no, do not delete it/i }).click()
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByRole('link', { name: /delete/i }).click()
    cy.url().should('to.match', /\/develop-an-initial-plan\/delete-identified-need\/1$/)
    cy.findByRole('button', { name: /yes, delete it/i }).click()
    cy.url().should('to.match', /\/identified-needs$/)
    cy.findByText(/no identified needs recorded/i).should('be.visible')
  }
})
