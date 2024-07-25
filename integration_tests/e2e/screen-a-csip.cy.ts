import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('Screen a CSIP Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubOutcomeType')
    cy.task('stubCsipRecordGetSuccess')
  })

  const START_URL = 'csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start'
  const getNfaRadio = () => cy.findByRole('radio', { name: /No further action/ })
  const getDescribeTextbox = () => cy.findByRole('textbox', { name: /Describe the reasons for this decision/ })

  it('happy path', () => {
    cy.signIn()
    cy.visit(START_URL)

    cy.url().should('include', '/screen/screen')
    getNfaRadio().click()
    checkAxeAccessibility()
    getDescribeTextbox().type('no action needed')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/check-answers')
  })

  it('should prepopulate radios after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)

    cy.url().should('include', '/screen/screen')
    getNfaRadio().click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/screen')
    getNfaRadio().should('be.checked')
  })

  it('should prepopulate textbox after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)

    cy.url().should('include', '/screen/screen')
    getNfaRadio().should('not.be.checked')
    getDescribeTextbox().type('no action needed')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/screen')
    getDescribeTextbox().should('include.text', 'no action needed')
  })

  it('should prepopulate data when navigating back', () => {
    cy.signIn()
    cy.visit(START_URL)

    cy.url().should('include', '/screen/screen')
    getNfaRadio().click()
    checkAxeAccessibility()
    getDescribeTextbox().type('no action needed')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/check-answers')
    cy.go('back')

    cy.url().should('include', '/screen/screen')
    getNfaRadio().should('be.checked')
    getDescribeTextbox().should('include.text', 'no action needed')
  })
})