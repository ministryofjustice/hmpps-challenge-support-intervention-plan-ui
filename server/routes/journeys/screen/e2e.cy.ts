import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('Screen a CSIP Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponentsFail')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubScreeningOutcomeType')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubPostSaferCustodyScreening')
    cy.task('stubGetCsipOverview')
  })

  const START_URL = 'csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550'
  const getScreenReferralButton = () => cy.findAllByText('Screen referral').first()
  const getNfaRadio = () => cy.findByRole('radio', { name: /Another option/ })
  const getDescribeTextbox = () => cy.findByRole('textbox', { name: /Describe the reasons for this decision/ })
  const getContinueButton = () => cy.findByRole('button', { name: /continue/i })
  const getCyaSubmitButton = () => cy.findByRole('button', { name: /Record outcome/i })
  const getChangeLink = () => cy.findAllByRole('link', { name: /Change/ }).first()

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`02e5854f-f7b1-4c56-bec8-69e390eb8550/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`, {
      failOnStatusCode: false,
    })

    cy.url().should('to.match', /\/not-authorised$/)
    cy.visit(`02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/check-answers`, { failOnStatusCode: false })
    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('happy path', () => {
    cy.signIn()
    cy.visit(START_URL)

    cy.visit(`02e5854f-f7b1-4c56-bec8-69e390eb8550/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`)

    injectJourneyDataAndReload('02e5854f-f7b1-4c56-bec8-69e390eb8550', { stateGuard: true })

    cy.url().should('include', '/screen')

    cy.visit(`02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/check-answers`)
    cy.url().should('match', /screen$/)

    getNfaRadio().click()
    checkAxeAccessibility()
    getDescribeTextbox().type('no action needed', { delay: 0 })
    getContinueButton().click()

    cy.url().should('include', '/screen/check-answers')
    checkAxeAccessibility()
    cy.findByText(/no action needed/i).should('be.visible')
    getChangeLink().click()

    cy.url().should('include', '/screen')
    getDescribeTextbox().type('modified', { delay: 0 })
    getContinueButton().click()

    cy.visit(`02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/confirmation`)
    cy.url().should('match', /screen\/check-answers$/)

    cy.url().should('include', '/screen/check-answers')
    cy.title().should('equal', 'Check your answers before recording the screening outcome - Screen CSIP referral - DPS')
    cy.findByText(/no action neededmodified/i).should('be.visible')
    getCyaSubmitButton().click()

    cy.url().should('include', '/screen/confirmation')
    cy.title().should('equal', 'CSIP screening outcome recorded - DPS')
    checkAxeAccessibility()

    // Bounce back to homepage on trying to go back to the journey pages
    injectJourneyDataAndReload('02e5854f-f7b1-4c56-bec8-69e390eb8550', { stateGuard: true })
    cy.go('back')
    cy.findByRole('heading', { name: /CSIP caseload for Leeds \(HMP\)/ }).should('be.visible')
  })

  it('should prepopulate radios after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)
    getScreenReferralButton().click()

    cy.url().should('include', '/screen')
    getNfaRadio().click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen')
    getNfaRadio().should('be.checked')
    cy.title().should('equal', 'Error: Screen CSIP referral - DPS')
  })

  it('should prepopulate textbox after an invalid input', () => {
    cy.signIn()
    cy.visit(START_URL)
    getScreenReferralButton().click()

    cy.url().should('include', '/screen')
    getNfaRadio().should('not.be.checked')
    getDescribeTextbox().type('no action needed', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen')
    getDescribeTextbox().should('include.text', 'no action needed')
  })

  it('should prepopulate data when navigating back', () => {
    cy.signIn()
    cy.visit(START_URL)
    getScreenReferralButton().click()

    cy.url().should('include', '/screen')
    getNfaRadio().click()
    checkAxeAccessibility()
    getDescribeTextbox().type('no action needed', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()

    cy.url().should('include', '/screen/check-answers')
    cy.go('back')

    cy.url().should('include', '/screen')
    getNfaRadio().should('be.checked')
    getDescribeTextbox().should('include.text', 'no action needed')
  })
})
