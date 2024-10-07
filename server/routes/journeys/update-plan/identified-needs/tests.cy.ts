import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-plan/identified-needs', () => {
  const uuid = uuidV4()

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
    checkAxeAccessibility()

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/identified-needs/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/identified-needs$/)
    cy.visit(`${uuid}/update-plan/identified-needs`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Update identified needs in Testname User’s plan/ }).should('be.visible')
    checkIdentifiedNeedsDetailsExist()
    cy.findByRole('link', { name: /cancel/i }).should('be.visible')
  }

  const checkIdentifiedNeedsDetailsExist = () => {
    cy.get('.govuk-summary-card').should('have.length', 3)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: 'first need' }).should('be.visible')
        cy.findByText('test testerson').should('be.visible')
        cy.findByText('02 April 2024').should('be.visible')
        cy.findByText('get it sorted').should('be.visible')
        cy.findByText('progression done').should('be.visible')
        cy.findByText('01 March 2024').should('be.visible')
        cy.findByRole('link', { name: /Change the person responsible \(first need\)/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the target date \(first need\)/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the summary of the identified need \(first need\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Add information to the planned intervention \(first need\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Add information to the actions and progress \(first need\)/i }).should(
          'be.visible',
        )
        cy.findByText('Open').should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('heading', { name: 'second need' }).should('be.visible')
        cy.findByText('foo barerson').should('be.visible')
        cy.findByText('01 June 2024').should('be.visible')
        cy.findByText('int1').should('be.visible')
        cy.findByText('almost there').should('be.visible')
        cy.findByText('01 April 2024').should('be.visible')
        cy.findByRole('link', { name: /Change the person responsible \(second need\)/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the target date \(second need\)/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the summary of the identified need \(second need\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Add information to the planned intervention \(second need\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', { name: /Add information to the actions and progress \(second need\)/i }).should(
          'be.visible',
        )
        cy.findByText('Open').should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.findByRole('heading', { name: 'closed need' }).should('be.visible')
        cy.findByText('joe bloggs').should('be.visible')
        cy.findByText('02 June 2024').should('be.visible')
        cy.findByText('we need to do things').should('be.visible')
        cy.findByText('Not provided').should('be.visible')
        cy.findByText('01 April 2024').should('be.visible')
        cy.findByRole('link', { name: /Change the person responsible/i }).should('not.exist')
        cy.findByRole('link', { name: /Change the target date/i }).should('not.exist')
        cy.findByRole('link', { name: /Change the summary of the identified need/i }).should('not.exist')
        cy.findByRole('link', { name: /Add information to the planned intervention/i }).should('not.exist')
        cy.findByRole('link', { name: /Add information to the actions and progress/i }).should('not.exist')
        cy.findByText('Closed').should('be.visible')
      })
  }
})
