import { v4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

const uuid = v4()

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('test area-of-work, including all edge cases', () => {
    setupDataSignInAndGo()

    checkValidation()

    checkValuesPersist()
  })

  const checkValuesPersist = () => {
    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ })
      .clear()
      .type(`25/12/2034`)
    cy.findByRole('button', { name: /continue/i }).click()
    cy.url().should('to.match', /\/check-answers$/)
    cy.go('back')
    cy.findByDisplayValue(`25/12/2034`).should('be.visible')
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: /set a date for the next CSIP review/i }).should('be.visible')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.contains('p', /enter the date for the next review/i).should('be.visible')
    cy.findByRole('link', { name: /enter the date for the next review/i })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ }).should('be.focused')

    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ }).type('35/07/2024')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.contains('p', /next review date must be a real date/i).should('be.visible')
    cy.findByRole('link', { name: /next review date must be a real date/i })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ }).should('be.focused')

    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ })
      .clear()
      .type('01/07/2024')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.contains('p', /next review date must be today or in the future/i).should('be.visible')
    cy.findByRole('link', { name: /next review date must be today or in the future/i })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ }).should('be.focused')

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')
    cy.findByText('Choose a plan that’s consistent with the targets and dates in Test Testersons’ plan')
  }

  const setupDataSignInAndGo = () => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      plan: {},
      prisoner: {
        firstName: 'Test',
        lastName: 'Testersons',
        cellLocation: '',
        prisonerNumber: 'A1111AA',
        prisonId: '',
      },
    })
    cy.visit(`${uuid}/develop-an-initial-plan/next-review-date`)
  }
})
