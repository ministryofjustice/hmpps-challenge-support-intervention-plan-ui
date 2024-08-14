context('check no standard apostrophes in visible content', () => {
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

  it('check no standard apostrophes in visible content for make a referral proactive', () => {
    checkApostrophesMakeAReferral(true)
  })

  it('check no standard apostrophes in visible content for make a referral reactive', () => {
    checkApostrophesMakeAReferral(false)
  })
})

const checkApostrophesMakeAReferral = (proactive: boolean) => {
  signinAndStart()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('combobox', { name: /which area do they work in\?/i }).select('AreaA')
  cy.findByRole('textbox', { name: /what’s their name\?/i }).type('Test, Member')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('radio', { name: proactive ? /proactive/i : /reactive/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('textbox', { name: /hour/i }).type('35')
  cy.findByRole('textbox', { name: /minute/i }).type('128')
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: proactive ? /date of occurrence/i : /date of incident/i }).type('06/07/2024')
  cy.findByRole('textbox', { name: /hour/i }).clear()
  cy.findByRole('textbox', { name: /minute/i }).clear()
  cy.findByRole('textbox', { name: /hour/i }).type('12')
  cy.findByRole('textbox', { name: /minute/i }).type('24')
  cy.findByRole('combobox', {
    name: proactive ? /where was the most recent occurrence of the behaviour\?/i : /where did the incident occur\?/i,
  }).select('LocationB')
  cy.findByRole('combobox', {
    name: proactive ? /what’s the main concern\?/i : /what was the incident type\?/i,
  }).select('TypeA')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('radio', { name: /factor1/i }).click()
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('TestStaff Member')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', {
    name: proactive ? /describe the behaviour and concerns/i : /describe the incident and concerns/i,
  }).type('incident concerns foobar123')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', {
    name: proactive
      ? /what reasons have been given for the behaviour/i
      : /what reasons have been given for the incident/i,
  }).type('a'.repeat(4002), {
    delay: 0,
  })
  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', {
    name: proactive
      ? /what reasons have been given for the behaviour/i
      : /what reasons have been given for the incident/i,
  }).clear()
  cy.findByRole('textbox', {
    name: proactive
      ? /what reasons have been given for the behaviour/i
      : /what reasons have been given for the incident/i,
  }).type('stuff goes here')
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('checkbox', { name: /factor1/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  checkNoUnCurlyApostrophesInText()
  cy.findByRole('link', { name: /add comment on factor1 factor/i }).click()

  cy.url().should('include', '/code1-comment')
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: /add a comment on factor1 factors \(optional\)/i }).type('a'.repeat(4002), {
    delay: 0,
  })
  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: /add a comment on factor1 factors \(optional\)/i }).clear()
  cy.findByRole('textbox', { name: /add a comment on factor1 factors \(optional\)/i }).type('factor comment')
  cy.findByRole('button', { name: /continue/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('radio', { name: /yes/i }).click()
  cy.findByRole('button', { name: /continue/i }).click()

  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('a'.repeat(4002), {
    delay: 0,
  })
  cy.findByRole('button', { name: /continue/i }).click()
  checkNoUnCurlyApostrophesInText()
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).clear()
  cy.findByRole('textbox', { name: /add additional information \(optional\)/i }).type('additional info')
  cy.findByRole('button', { name: /continue/i }).click()

  checkNoUnCurlyApostrophesInText()
  cy.findByRole('button', { name: /Confirm and send/i }).click()

  checkNoUnCurlyApostrophesInText()
}

const checkNoUnCurlyApostrophesInText = () => {
  cy.findByText(/[\s\S]*'[\s\S]*/i).should('not.exist')
}

const signinAndStart = () => {
  cy.signIn()
  cy.visit('/prisoners/A1111AA/referral/start')
}
