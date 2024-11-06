import { expect } from 'chai'
import { checkAxeAccessibility } from '../support/accessibilityViolations'

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

  it('happy path', () => {
    signinAndStart()

    prisonerProfileShouldDisplay()

    fillInformationReactiveNotOnBehalf()

    goBackCheckInfoSaved(false, false)

    changeInformationProactiveOnBehalf()

    goBackCheckInfoSaved(true, true)

    goFromFirstScreenToCheckYourAnswersPage()

    changeAnswersOnCYAPage()

    cy.findByRole('button', { name: /Confirm and submit/i }).click()
    cy.url().should('include', '/confirmation')
    checkAxeAccessibility()
    cy.findByRole('heading', { name: /CSIP referral complete/i })
      .should('be.visible')
      .next()
      .should('include.text', 'Status: Referral submitted')

    cy.go('back')
    // There is nothing to test or wait on when going back here - the entire redirection is handled in the express middleware, so we just wait for a second to ensure
    // that we arent just immediately testing that the same url is there, and then that the state handling has redirected us back to confirmation
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
    cy.url().should('include', '/confirmation')
  })

  it('user stays on page after inputting invalid data after changing their answers', () => {
    signinAndStart()

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

const signinAndStart = () => {
  cy.signIn()
  cy.visit('/prisoners/A1111AA/referral/start')
}

const prisonerProfileShouldDisplay = () => {
  cy.findByRole('img', { name: /Image of User, Testname/ }).should('be.visible')
  cy.findByRole('link', { name: /User, Testname/ }).should('be.visible')
  cy.findByText('A1111AA').should('be.visible')
  cy.findByText('02/02/1932').should('be.visible')
  cy.findByText('HMP Kirkham').should('be.visible')
  cy.findByText('A-1-1').should('be.visible')
  cy.findByText('On remand').should('be.visible')
}

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
  cy.findByDisplayValue('6/7/2024').should('be.visible')
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
  cy.findByRole('heading', { name: /Describe the behaviour and the concerns relating to the behaviour/i }).should(
    'be.visible',
  )
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
  cy.findByDisplayValue('6/7/2024').should('be.visible')
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
  cy.findByRole('heading', { name: /When was the incident\?/i }).should('be.visible')
  cy.findByRole('textbox', { name: /date of incident/i }).type('6/7/2024', { delay: 0 })
  cy.findByRole('textbox', { name: /hour/i }).type('12', { delay: 0 })
  cy.findByRole('textbox', { name: /minute/i }).type('24', { delay: 0 })
  cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select('LocationB')
  cy.findByRole('combobox', { name: /what was the incident type\?/i }).select('TypeA')
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/involvement')
  cy.findByRole('heading', { name: /incident involvement/i }).should('be.visible')
  cy.findByRole('radio', { name: /factor1/i }).click()
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('TestStaff Member', { delay: 0 })
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/description')
  cy.findByRole('heading', { name: /Describe the incident and the concerns relating to the incident/i }).should(
    'be.visible',
  )
  // Cypress does not check the visibility of elements inside <details> elements properly, so use browser builtins instead
  cy.findByText(/the description could include/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(false)
  })
  cy.findByText(/what type of information to include/i).click()
  cy.findByText(/the description could include/i).then(el => {
    expect(el.get(0).checkVisibility()).to.eq(true)
  })
  cy.findByRole('textbox', { name: /Describe the incident and the concerns relating to the incident/i }).type(
    'incident concerns foobar123',
    { delay: 0 },
  )
  checkAxeAccessibility()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.url().should('include', '/reasons')
  cy.findByRole('heading', { name: /what reasons have been given for the incident\?/i }).should('be.visible')
  cy.findByRole('textbox', { name: /what reasons have been given for the incident/i }).type(
    'incident reasons foobar123',
    { delay: 0 },
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
  cy.findByRole('textbox', { name: /add a comment on factor1 factors \(optional\)/i }).type('factor comment', {
    delay: 0,
  })
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
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('additional info', { delay: 0 })
  checkAxeAccessibility()
}

const goFromFirstScreenToCheckYourAnswersPage = () => {
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('additional info', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.url().should('include', '/check-answers')
  checkAxeAccessibility()
}

const changeAnswersOnCYAPage = () => {
  cy.contains('dt', 'Name of referrer').next().should('include.text', 'John Smith')
  cy.findByRole('link', { name: /change name of referrer/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /What’s their name?/i }).clear()
  cy.findByRole('textbox', { name: /What’s their name?/i }).type('Joe Doe', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Name of referrer').next().should('include.text', 'Joe Doe')

  cy.contains('dt', 'Referral made on behalf of someone else').next().should('include.text', 'Yes')
  cy.findByRole('link', { name: /change if the referral is being made on behalf of someone else or not/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /no/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Referral made on behalf of someone else').next().should('include.text', 'No')
  cy.contains('dt', 'Name of referrer').should('not.exist')

  cy.contains('dt', 'Area of work').next().should('include.text', 'AreaA')
  cy.findByRole('link', { name: /change area of work/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('combobox', { name: /which area do you work in\?/i }).select('AreaB')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Area of work').next().should('include.text', 'AreaB')

  changeAnswersOnCYAProactiveSection()

  cy.contains('dt', 'Proactive or reactive referral').next().should('include.text', 'Proactive')
  cy.findByRole('link', { name: /change if the referral is proactive or reactive/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /reactive/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Proactive or reactive referral').next().should('include.text', 'Reactive')

  changeAnswersOnCYAReactiveSection()

  cy.contains('dt', 'Contributory factors').next().should('include.text', 'Factor1Factor3')
  cy.findByRole('link', { name: /change the contributory factors/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('checkbox', { name: /factor2/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Contributory factors').next().should('include.text', 'Factor1Factor2Factor3')

  cy.contains('dt', 'Comment on factor2').next().should('include.text', 'Not provided')
  cy.findByRole('link', { name: /change the comment on factor2 factor/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /add a comment on factor2 factors \(optional\)/i }).type('factor two comment', {
    delay: 0,
  })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Comment on factor2').next().should('include.text', 'factor two comment')

  cy.contains('dt', 'Safer Custody aware of referral').next().should('include.text', 'Yes')
  cy.findByRole('link', { name: /change if Safer Custody are aware of the referral or not/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /^no$/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Safer Custody aware of referral').next().should('include.text', 'No')

  cy.contains('dt', 'Other information relating to this referral').next().should('include.text', 'additional info')
  cy.findByRole('link', { name: /change the additional information relating to the referral/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).clear()
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('other additional info', {
    delay: 0,
  })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Other information relating to this referral')
    .next()
    .should('include.text', 'other additional info')
}

const changeAnswersOnCYAProactiveSection = () => {
  cy.contains('dt', 'Date of occurrence').next().should('include.text', '6 July 2024')
  cy.findByRole('link', { name: /change date of occurrence/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /Date of occurrence/i }).clear()
  cy.findByRole('textbox', { name: /Date of occurrence/i }).type('5/5/2024', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Date of occurrence').next().should('include.text', '5 May 2024')

  cy.contains('dt', 'Time of occurrence').next().should('include.text', '12:24')
  cy.findByRole('link', { name: /change time of occurrence/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /hour/i }).clear()
  cy.findByRole('textbox', { name: /minute/i }).clear()
  cy.findByRole('textbox', { name: /hour/i }).type('23', { delay: 0 })
  cy.findByRole('textbox', { name: /minute/i }).type('59', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Time of occurrence').next().should('include.text', '23:59')

  cy.contains('dt', 'Location of occurrence').next().should('include.text', 'LocationB')
  cy.findByRole('link', { name: /change location of occurrence/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('combobox', { name: /Where was the most recent occurrence of the behaviour\?/i }).select('LocationA')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Location of occurrence').next().should('include.text', 'LocationA')

  cy.contains('dt', 'Main concern').next().should('include.text', 'TypeA')
  cy.findByRole('link', { name: /change main concern/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('combobox', { name: /What’s the main concern\?/i }).select('TypeB')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Main concern').next().should('include.text', 'TypeB')

  cy.contains('dt', 'Prisoner involvement').next().should('include.text', 'Factor1')
  cy.findByRole('link', { name: /change how the prisoner was involved/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /factor2/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Prisoner involvement').next().should('include.text', 'Factor2')

  cy.contains('dt', 'Names of staff assaulted').next().should('include.text', 'TestStaff Member')
  cy.findByRole('link', { name: /change the name of the staff members assaulted/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('Test, Member', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Names of staff assaulted').next().should('include.text', 'Test, Member')

  cy.contains('dt', 'Staff assaulted').next().should('include.text', 'Yes')
  cy.findByRole('link', { name: /change if a staff member was assaulted or not/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /no/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Staff assaulted').next().should('include.text', 'No')

  cy.contains('dt', 'Description of behaviour and concerns')
    .next()
    .should('include.text', 'incident concerns foobar123')
  cy.findByRole('link', { name: /change the description of the behaviour and concerns/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /Describe the behaviour and the concerns relating to the behaviour/i }).clear()
  cy.findByRole('textbox', { name: /Describe the behaviour and the concerns relating to the behaviour/i }).type(
    'incident concerns foobar456',
    { delay: 0 },
  )
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Description of behaviour and concerns')
    .next()
    .should('include.text', 'incident concerns foobar456')

  cy.contains('dt', 'Reasons given for the behaviour').next().should('include.text', 'incident reasons foobar123')
  cy.findByRole('link', { name: /change the reasons given for the behaviour/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /what reasons have been given for the behaviour/i }).clear()
  cy.findByRole('textbox', { name: /what reasons have been given for the behaviour/i }).type(
    'incident reasons foobar456',
    { delay: 0 },
  )
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Reasons given for the behaviour').next().should('include.text', 'incident reasons foobar456')
}

const changeAnswersOnCYAReactiveSection = () => {
  cy.contains('dt', 'Date of incident').next().should('include.text', '5 May 2024')
  cy.findByRole('link', { name: /change date of incident/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /Date of incident/i }).clear()
  cy.findByRole('textbox', { name: /Date of incident/i }).type('6/6/2024', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Date of incident').next().should('include.text', '6 June 2024')

  cy.contains('dt', 'Time of incident').next().should('include.text', '23:59')
  cy.findByRole('link', { name: /change time of incident/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /hour/i }).clear()
  cy.findByRole('textbox', { name: /minute/i }).clear()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Time of incident').next().should('include.text', 'Not provided')

  cy.contains('dt', 'Location of incident').next().should('include.text', 'LocationA')
  cy.findByRole('link', { name: /change location of incident/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('combobox', { name: /Where did the incident occur\?/i }).select('LocationB')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Location of incident').next().should('include.text', 'LocationB')

  cy.contains('dt', 'Incident type').next().should('include.text', 'TypeB')
  cy.findByRole('link', { name: /change incident type/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('combobox', { name: /What was the incident type\?/i }).select('TypeA')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Incident type').next().should('include.text', 'TypeA')

  cy.contains('dt', 'Prisoner involvement').next().should('include.text', 'Factor2')
  cy.findByRole('link', { name: /change how the prisoner was involved/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /factor1/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Prisoner involvement').next().should('include.text', 'Factor1')

  cy.contains('dt', 'Staff assaulted').next().should('include.text', 'No')
  cy.findByRole('link', { name: /change if a staff member was assaulted or not/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('Test, Member', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Staff assaulted').next().should('include.text', 'Yes')

  cy.contains('dt', 'Names of staff assaulted').next().should('include.text', 'Test, Member')
  cy.findByRole('link', { name: /change the name of the staff members assaulted/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('Test Member', { delay: 0 })
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Names of staff assaulted').next().should('include.text', 'Test Member')

  cy.contains('dt', 'Description of incident and concerns').next().should('include.text', 'incident concerns foobar456')
  cy.findByRole('link', { name: /change the description of the incident and concerns/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /Describe the incident and the concerns relating to the incident/i }).clear()
  cy.findByRole('textbox', { name: /Describe the incident and the concerns relating to the incident/i }).type(
    'incident concerns foobar789',
    { delay: 0 },
  )
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Description of incident and concerns').next().should('include.text', 'incident concerns foobar789')

  cy.contains('dt', 'Reasons given for the incident').next().should('include.text', 'incident reasons foobar456')
  cy.findByRole('link', { name: /change the reasons given for the incident/i })
    .should('be.visible')
    .click()
  cy.findByRole('link', { name: /^back/i }).should('have.attr', 'href').and('include', 'check-answers')
  cy.findByRole('textbox', { name: /what reasons have been given for the incident/i }).clear()
  cy.findByRole('textbox', { name: /what reasons have been given for the incident/i }).type(
    'incident reasons foobar789',
    { delay: 0 },
  )
  cy.findByRole('button', { name: /continue/i }).click()
  cy.contains('dt', 'Reasons given for the incident').next().should('include.text', 'incident reasons foobar789')
}
