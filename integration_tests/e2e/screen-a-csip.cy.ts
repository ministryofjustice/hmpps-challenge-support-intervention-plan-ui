import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('Screen a CSIP Referral Journey', () => {
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
    cy.task('stubOutcomeType')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubPostSaferCustodyScreening')
  })

  const START_URL = 'csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550'
  const getScreenReferralButton = () => cy.findAllByText('Screen referral').first()
  const getNfaRadio = () => cy.findByRole('radio', { name: /Another option/ })
  const getDescribeTextbox = () => cy.findByRole('textbox', { name: /Describe the reasons for this decision/ })
  const getContinueButton = () => cy.findByRole('button', { name: /continue/i })
  const getCyaSubmitButton = () => cy.findByRole('button', { name: /Record outcome/i })
  const getChangeLink = () => cy.findAllByRole('link', { name: /Change/ }).first()

  it('happy path', () => {
    cy.signIn()
    cy.visit(START_URL)

    getScreenReferralButton().click()

    cy.url().should('include', '/screen/screen')
    getNfaRadio().click()
    checkAxeAccessibility()
    getDescribeTextbox().type('no action needed')
    getContinueButton().click()

    cy.url().should('include', '/screen/check-answers')
    checkAxeAccessibility()
    cy.findByText(/no action needed/i).should('be.visible')
    getChangeLink().click()

    cy.url().should('include', '/screen/screen')
    getDescribeTextbox().type('modified')
    getContinueButton().click()

    cy.url().should('include', '/screen/check-answers')
    cy.findByText(/no action neededmodified/i).should('be.visible')
    getCyaSubmitButton().click()

    cy.url().should('include', '/screen/confirmation')
    checkAxeAccessibility()

    // Prevent double submissions after journey is complete
    cy.go('back')
    cy.url().should('include', '/screen/confirmation')
  })

  it('should prepopulate radios after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)
    getScreenReferralButton().click()

    cy.url().should('include', '/screen/screen')
    getNfaRadio().click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/screen')
    getNfaRadio().should('be.checked')
  })

  it('should prepopulate textbox after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)
    getScreenReferralButton().click()

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
    getScreenReferralButton().click()

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
