import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('Make a Referral Journey', () => {
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
    cy.findByRole('textbox', { name: /date of incident/i }).clear()
    cy.findByRole('textbox', { name: /hour/i }).clear()
    cy.findByRole('textbox', { name: /minute/i }).clear()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('textbox', { name: /date of incident/i }).should('have.value', '')
    cy.findByRole('textbox', { name: /hour/i }).should('have.value', '')
    cy.findByRole('textbox', { name: /minute/i }).should('have.value', '')

    cy.findByRole('textbox', { name: /date of incident/i }).type('25/12/2001', { delay: 0 })
    cy.findByRole('textbox', { name: /hour/i }).type('23', { delay: 0 })
    cy.findByRole('textbox', { name: /minute/i }).type('23', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
  }

  const goBackCheckWithProactive = () => {
    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /proactive/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.title().should('equal', 'Behaviour details - Make a CSIP referral - DPS')
    cy.findByRole('textbox', { name: /date of occurrence/i }).should('have.value', '25/12/2001')
    cy.findByRole('textbox', { name: /hour/i }).should('have.value', '23')
    cy.findByRole('textbox', { name: /minute/i }).should('have.value', '23')
    cy.findByRole('combobox', { name: /where was the most recent occurrence of the behaviour\?/i }).should(
      'have.value',
      'A',
    )
    cy.findByRole('combobox', { name: /what’s the main concern\?/i }).should('have.value', 'A')

    cy.findByRole('textbox', { name: /date of occurrence/i }).clear()
    cy.findByRole('textbox', { name: /hour/i }).type('52', { delay: 0 })
    cy.findByRole('textbox', { name: /minute/i }).type('52', { delay: 0 })
    cy.findByRole('combobox', { name: /where was the most recent occurrence of the behaviour\?/i }).select(0)
    cy.findByRole('combobox', { name: /what’s the main concern\?/i }).select(0)
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the most recent occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the most recent occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /select the main concern/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 4)
  }

  const checkDatepickerEdgeCases = () => {
    // Select valid options for all other inputs
    cy.findByRole('textbox', { name: /hour/i }).type('23', { delay: 0 })
    cy.findByRole('textbox', { name: /minute/i }).type('23', { delay: 0 })
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(1)
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(1)

    // Invalid date check
    cy.findByRole('textbox', { name: /date of incident/i }).type('35/07/2024', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /date of the incident must be a real date/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('textbox', { name: /date of incident/i }).clear()

    // Future date check
    const today = new Date()
    const tomorrow = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1)) // this will tick over if today is last day of month
    cy.findByRole('textbox', { name: /date of incident/i }).type(
      `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`,
      { delay: 0 },
    )
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /date of the incident must be today or in the past/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('textbox', { name: /date of incident/i }).clear()

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
    cy.findByRole('textbox', { name: /date of incident/i }).should(
      'have.value',
      `1/${today.getMonth() + 1}/${today.getFullYear()}`,
    )
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/involvement')
  }

  const submitCheckErrorMessagesDisappear = () => {
    // Get all error messages to appear
    cy.findByRole('textbox', { name: /hour/i }).type('25', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 4)

    // Check they're in the right order
    cy.get('.govuk-error-summary li:nth-of-type(1) a').should('have.text', 'Enter the date of the incident')
    cy.get('.govuk-error-summary li:nth-of-type(2) a').should('have.text', 'Enter a time using the 24-hour clock')
    cy.get('.govuk-error-summary li:nth-of-type(3) a').should('have.text', 'Select the location of the incident')
    cy.get('.govuk-error-summary li:nth-of-type(4) a').should('have.text', 'Select the incident type')

    // Check type error message disappears
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(1)
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('not.exist')
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).should('have.value', 'A')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check location error message disappears
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(0)
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(1)
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('not.exist')
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).should('have.value', 'A')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check date error message disappears
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(0)
    cy.findByRole('textbox', { name: /date of incident/i }).type('01/01/2024', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('be.visible')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('not.exist')
    cy.findByRole('textbox', { name: /date of incident/i }).should('have.value', '1/1/2024')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    // Check time error message disappears
    cy.findByRole('textbox', { name: /date of incident/i }).clear()
    cy.findByRole('textbox', { name: /hour/i }).clear()
    cy.findByRole('textbox', { name: /hour/i }).type('23', { delay: 0 })
    cy.findByRole('textbox', { name: /minute/i }).type('24', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /enter a time using the 24-hour clock/i }).should('not.exist')
    cy.findByRole('textbox', { name: /hour/i }).should('have.value', '23')
    cy.findByRole('textbox', { name: /minute/i }).should('have.value', '24')
    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')
    cy.get('.govuk-error-summary a').should('have.length', 3)

    cy.findByRole('textbox', { name: /hour/i }).clear()
    cy.findByRole('textbox', { name: /minute/i }).clear()
    cy.findByRole('textbox', { name: /date of incident/i }).clear()
  }

  const submitNoValues = () => {
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /enter the date of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the location of the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select the incident type/i }).should('be.visible')

    cy.findByRole('link', { name: /enter the date of the incident/i }).click()
    cy.findByRole('textbox', { name: /date of incident/i }).should('be.focused')

    cy.findByRole('link', { name: /select the location of the incident/i }).click()
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).should('be.focused')

    cy.findByRole('link', { name: /select the incident type/i }).click()
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).should('be.focused')

    cy.get('.govuk-error-summary a').should('have.length', 3)
  }

  const navigateToDetailsReactive = () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')

    cy.url().should('include', '/on-behalf-of')
    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/area-of-work')
    cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('AreaA')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/proactive-or-reactive')
    cy.findByRole('radio', { name: /reactive/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/details')
  }
})
