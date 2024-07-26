import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
  })

  it('happy path', () => {
    fillInformationReactiveNotOnBehalf()

    goBackCheckInfoSaved(false, false)

    changeInformationProactiveOnBehalf()

    goBackCheckInfoSaved(true, true)

    // TODO: We should now continue all the way to CYA page, which isn't implemented yet - then check answers and do edits + checks
  })

  it('user stays on page after inputting invalid data after changing their answers', () => {
    fillInformationReactiveNotOnBehalf()

    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/check-answers')

    cy.findByText('Area of work').parent().findByText('Change').click()
    cy.url().should('include', 'area-of-work')

    cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('Select area')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', 'area-of-work')
    cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('AreaB')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', 'check-answers')
  })
})

const changeInformationProactiveOnBehalf = () => {
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/referrer')
  cy.findByDisplayValue(/john smith/i).should('be.visible')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/proactive-or-reactive')
  cy.findByRole('radio', { name: /proactive/i }).click()
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/details')
  cy.findByRole('heading', { name: /behaviour details/i }).should('be.visible')
  cy.findByDisplayValue('06/07/2024').should('be.visible')
  cy.findByDisplayValue('12').should('be.visible')
  cy.findByDisplayValue('24').should('be.visible')
  cy.findByDisplayValue('LocationB').should('be.visible')
  cy.findByDisplayValue('TypeA').should('be.visible')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/involvement')
  cy.findByRole('heading', { name: /behaviour involvement/i }).should('be.visible')
  cy.findByDisplayValue('TestStaff Member').should('be.visible')
  cy.findByRole('radio', { name: /yes/i }).should('be.checked')
  cy.findByRole('radio', { name: /factor1/i }).should('be.checked')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/description')
  cy.findByRole('heading', { name: /describe the behaviour and concerns/i }).should('be.visible')
  cy.findByDisplayValue('incident concerns foobar123').should('be.visible')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/reasons')
  cy.findByRole('heading', { name: /what reasons have been given for the behaviour\?/i }).should('be.visible')
  cy.findByDisplayValue('incident reasons foobar123').should('be.visible')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/contributory-factors')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/contributory-factors-comments')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.url().should('include', '/safer-custody')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.url().should('include', '/additional-information')
}

const goBackCheckInfoSaved = (onBehalfOf: boolean, proactive: boolean) => {
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/safer-custody')
  cy.findByRole('radio', { name: /yes/i }).should('be.checked')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/contributory-factors-comments')
  cy.findByRole('link', { name: /edit comment/i }).should('be.visible')
  cy.findByRole('link', { name: /edit comment/i }).click()
  cy.url().should('include', '/code1-comment')
  cy.findByDisplayValue('factor comment').should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()
  cy.url().should('include', '/contributory-factors-comments')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/contributory-factors')
  cy.findByRole('checkbox', { name: /factor1/i }).should('be.checked')
  cy.findByRole('checkbox', { name: /factor3/i }).should('be.checked')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/reasons')
  cy.findByDisplayValue('incident reasons foobar123').should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/description')
  cy.findByDisplayValue('incident concerns foobar123').should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/involvement')
  cy.findByDisplayValue('TestStaff Member').should('be.visible')
  cy.findByRole('radio', { name: /yes/i }).should('be.checked')
  cy.findByRole('radio', { name: /factor1/i }).should('be.checked')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/details')
  cy.findByDisplayValue('06/07/2024').should('be.visible')
  cy.findByDisplayValue('12').should('be.visible')
  cy.findByDisplayValue('24').should('be.visible')
  cy.findByDisplayValue('LocationB').should('be.visible')
  cy.findByDisplayValue('TypeA').should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/proactive-or-reactive')
  cy.findByRole('radio', { name: proactive ? /proactive/i : /reactive/i }).should('be.checked')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', onBehalfOf ? '/referrer' : '/area-of-work')
  cy.findByDisplayValue('AreaA').should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()

  cy.url().should('include', '/on-behalf-of')
  cy.findByRole('radio', { name: onBehalfOf ? /yes/i : /no/i }).should('be.checked')
}

const fillInformationReactiveNotOnBehalf = () => {
  cy.signIn()
  cy.visit('/prisoners/A1111AA/referral/start')

  cy.url().should('include', '/on-behalf-of')
  cy.findByRole('radio', { name: /no/i }).click()
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/area-of-work')
  cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('AreaA')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/proactive-or-reactive')
  cy.findByRole('radio', { name: /reactive/i }).click()
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/details')
  cy.findByRole('heading', { name: /incident details/i }).should('be.visible')
  cy.findByRole('heading', { name: /when did the incident occur\?/i }).should('be.visible')
  cy.findByRole('textbox', { name: /date of incident/i }).type('06/07/2024')
  cy.findByRole('textbox', { name: /hour/i }).type('12')
  cy.findByRole('textbox', { name: /minute/i }).type('24')
  cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select('LocationB')
  cy.findByRole('combobox', { name: /what was the incident type\?/i }).select('TypeA')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/involvement')
  cy.findByRole('heading', { name: /incident involvement/i }).should('be.visible')
  cy.findByRole('radio', { name: /factor1/i }).click()
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('TestStaff Member')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/description')
  cy.findByRole('heading', { name: /describe the incident and concerns/i }).should('be.visible')
  // Cypress does not check the visibility of elements inside <details> elements properly, so use browser builtins instead
  cy.findByText(/the description could include/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(false)
  })
  cy.findByText(/what type of information to include/i).click()
  cy.findByText(/the description could include/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(true)
  })
  cy.findByRole('textbox', { name: /describe the incident and concerns/i }).type('incident concerns foobar123')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/reasons')
  cy.findByRole('heading', { name: /what reasons have been given for the incident\?/i }).should('be.visible')
  cy.findByText(/include any reasons given/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(false)
  })
  cy.findByText(/what type of information to include/i).click()
  cy.findByText(/include any reasons given/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(true)
  })
  cy.findByRole('textbox', { name: /what reasons have been given for the incident/i }).type(
    'incident reasons foobar123',
  )
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/contributory-factors')
  cy.findByRole('heading', { name: /what are the contributory factors\?/i }).should('be.visible')
  cy.findByRole('checkbox', { name: /factor1/i }).click()
  cy.findByRole('checkbox', { name: /factor3/i }).click()
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/contributory-factors-comments')
  cy.findAllByRole('link', { name: /add comment/i }).should('have.length', 2)
  cy.findByRole('link', { name: /add comment on factor1 factor/i })
    .should('be.visible')
    .click()
  cy.url().should('include', '/code1-comment')
  cy.findByRole('heading', { name: /add a comment on factor1 factors \(optional\)/i }).should('be.visible')
  cy.findByRole('link', { name: /^back/i }).click()
  cy.url().should('include', '/contributory-factors-comments')
  cy.findAllByRole('link', { name: /add comment/i })
    .first()
    .should('be.visible')
    .click()
  cy.url().should('include', '/code1-comment')
  cy.findByRole('textbox', { name: /add a comment on factor1 factors \(optional\)/i }).type('factor comment')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.url().should('include', '/contributory-factors-comments')
  cy.findByRole('link', { name: /edit comment/i }).should('be.visible')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/safer-custody')
  cy.findByRole('heading', { name: /is the safer custody team already aware of this referral\?/i }).should('be.visible')
  cy.findByRole('radio', { name: /yes/i }).click()
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/additional-information')
  cy.findByRole('heading', { name: /add additional information \(optional\)/i }).should('be.visible')
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('additional info')
  checkAxeAccessibility()
}
