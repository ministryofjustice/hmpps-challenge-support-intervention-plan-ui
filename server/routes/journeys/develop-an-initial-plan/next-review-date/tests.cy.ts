import { v4 } from 'uuid'
import { getDaysInMonth } from 'date-fns'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

const uuid = v4()

context('DiAP next review date', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('test next-review-date, including all edge cases', () => {
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
    checkAxeAccessibility()
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

    // Get the datepicker set to the current date then check previous dates are not selectable
    const today = new Date()
    cy.findByRole('textbox', { name: /When will you next review the plan with Test Testersons\?/ })
      .clear()
      .type(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`)
    cy.findByRole('button', { name: /choose date/i }).click()
    cy.findAllByRole('button', { name: /Excluded date.*/i, hidden: true }).should('have.length', today.getDate() - 1)
    cy.findByRole('button', { name: /previous month/i }).click()
    cy.findAllByRole('button', { name: /Excluded date.*/i, hidden: true }).should(
      'have.length',
      getDaysInMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    )

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')
    cy.findByText(/Choose a review date that’s consistent with the targets and dates in Test Testersons’ plan/).should(
      'be.visible',
    )
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
