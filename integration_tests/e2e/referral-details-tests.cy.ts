import { expect } from 'chai'
import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { JourneyData } from '../../server/@types/express'

context('Make a Referral Journey', () => {
  const uuid = uuidV4()
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordPostSuccess')
  })

  const getIncidentDate = () => cy.findByRole('textbox', { name: /date of incident/i })
  const getHour = () => cy.findByRole('textbox', { name: /hour/i })
  const getMinute = () => cy.findByRole('textbox', { name: /minute/i })
  const getContinue = () => cy.findByRole('button', { name: /continue/i })

  it('should try out all edge cases', () => {
    navigateToDetailsReactive()
    cy.title().should('equal', 'Incident details - Make a CSIP referral - DPS')
    checkAxeAccessibility()

    submitNoValues()

    submitCheckErrorMessagesDisappear()

    checkDatepickerEdgeCases()

    checkEmptyInputNotOverriddenByJourneyData()

    goBackCheckWithProactive()
  })

  const checkEmptyInputNotOverriddenByJourneyData = () => {
    cy.findByRole('link', { name: /^back/i }).click()
    getIncidentDate().clear()
    getHour().clear()
    getMinute().clear()
    getContinue().click()

    getIncidentDate().should('have.value', '')
    getHour().should('have.value', '')
    getMinute().should('have.value', '')

    getIncidentDate().type('25/12/2001', { delay: 0 })
    getHour().type('23', { delay: 0 })
    getMinute().type('23', { delay: 0 })
    getContinue().click()
  }

  const goBackCheckWithProactive = () => {
    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /proactive/i }).click()
    getContinue().click()

    cy.title().should('equal', 'Behaviour details - Make a CSIP referral - DPS')
    cy.findByRole('textbox', { name: /date of occurrence/i }).should('have.value', '25/12/2001')
    getHour().should('have.value', '23')
    getMinute().should('have.value', '23')
    cy.findByRole('combobox', { name: /where was the most recent occurrence of the behaviour\?/i }).should(
      'have.value',
      'A',
    )
    cy.findByRole('combobox', { name: /what’s the main concern\?/i }).should('have.value', 'A')

    cy.findByRole('textbox', { name: /date of occurrence/i }).clear()
    getHour().type('52', { delay: 0 })
    getMinute().type('52', { delay: 0 })
    cy.findByRole('combobox', { name: /where was the most recent occurrence of the behaviour\?/i }).select(0)
    cy.findByRole('combobox', { name: /what’s the main concern\?/i }).select(0)
    getContinue().click()

    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the most recent occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the most recent occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /select the main concern/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 4)
  }

  const checkDatepickerEdgeCases = () => {
    // Select valid options for all other inputs
    getHour().type(' 2', { delay: 0 })
    getMinute().type('2 ', { delay: 0 })
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(1)
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(1)

    // Invalid date check
    getIncidentDate().type('35/07/2024', { delay: 0 })
    getContinue().click()
    cy.findByRole('link', { name: /date of the incident must be a real date/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 1)
    getIncidentDate().clear()

    // Future date check
    const today = new Date()
    const tomorrow = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1)) // this will tick over if today is last day of month
    getIncidentDate().type(`${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`, { delay: 0 })
    getContinue().click()
    cy.findByRole('link', { name: /date of the incident must be today or in the past/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 1)
    getIncidentDate().clear()

    cy.findByRole('button', { name: /choose date/i }).click()
    cy.findByRole('button', { name: /select/i }).should('be.visible') // Don't test the entire component - we assume it works ok, just test that it appears so we know we've integrated it

    // Check selecting today works
    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    cy.findByRole('button', {
      name: firstOfMonth
        .toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .replace(',', ''),
    }).click()
    getIncidentDate().should('have.value', `1/${today.getMonth() + 1}/${today.getFullYear()}`)
    getContinue().click()

    cy.url().should('include', '/involvement')

    cy.verifyJourneyData(uuid, (data: JourneyData) => {
      expect(data.referral?.incidentTime).to.equal('02:02:00')
    })
  }

  const submitCheckErrorMessagesDisappear = () => {
    // Get all error messages to appear
    getHour().type('25', { delay: 0 })
    getContinue().click()
    cy.get('.govuk-error-summary a').should('have.length', 4)

    // Check they're in the right order
    cy.get('.govuk-error-summary li:nth-of-type(1) a').should('have.text', 'Enter the date of the incident')
    cy.get('.govuk-error-summary li:nth-of-type(2) a').should('have.text', 'Enter a time using the 24-hour clock')
    cy.get('.govuk-error-summary li:nth-of-type(3) a').should('have.text', 'Select the location of the incident')
    cy.get('.govuk-error-summary li:nth-of-type(4) a').should('have.text', 'Select the incident type')

    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i })
      .should('be.visible')
      .click()

    cy.focused().should('have.attr', 'name', 'hour')

    // Check type error message disappears
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(1)
    getContinue().click()
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('not.exist')
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).should('have.value', 'A')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check location error message disappears
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(0)
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(1)
    getContinue().click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('not.exist')
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).should('have.value', 'A')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check date error message disappears
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(0)
    getIncidentDate().type('1/1/2024', { delay: 0 })
    getContinue().click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('not.exist')
    getIncidentDate().should('have.value', '1/1/2024')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check time error message disappears
    getIncidentDate().clear()
    getHour().clear()
    getHour().type('23', { delay: 0 })
    getMinute().type('24', { delay: 0 })
    getContinue().click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('not.exist')
    getHour().should('have.value', '23')
    getMinute().should('have.value', '24')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    getHour().clear()
    getMinute().clear()
    getIncidentDate().clear()
  }

  const submitNoValues = () => {
    getContinue().click()

    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')

    cy.findByRole('link', { name: /enter the date of the incident/i }).click()
    getIncidentDate().should('be.focused')

    cy.findByRole('link', { name: /select the location of the incident/i }).click()
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).should('be.focused')

    cy.findByRole('link', { name: /select the incident type/i }).click()
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).should('be.focused')

    cy.get('.govuk-error-summary a').should('have.length', 3)
  }

  const navigateToDetailsReactive = () => {
    cy.signIn()
    cy.visit(`${uuid}/prisoners/A1111AA/referral/start`)

    cy.url().should('include', '/on-behalf-of')
    cy.findByRole('radio', { name: /no/i }).click()
    getContinue().click()

    cy.url().should('include', '/area-of-work')
    cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('AreaA')
    getContinue().click()

    cy.url().should('include', '/proactive-or-reactive')
    cy.findByRole('radio', { name: /reactive/i }).click()
    getContinue().click()

    cy.url().should('include', '/details')
  }
})
