import { checkAxeAccessibility } from '../../integration_tests/support/accessibilityViolations'

context('test / homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetCsipOverview')
  })

  it('tests page', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.findByRole('heading', { name: /CSIP \(Challenge, Support and Intervention Plans\)/ }).should('be.visible')
    cy.findByRole('heading', { name: /CSIP caseload for Leeds \(HMP\)/ }).should('be.visible')

    cy.findByRole('link', { name: /^View and manage CSIPs$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?clear=true$/)

    cy.findByRole('link', { name: /^How to make a CSIP referral$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /how-to-make-a-referral$/)

    cy.findByRole('link', { name: /^View referrals with status ‘Referral submitted’$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=REFERRAL_SUBMITTED$/)
    cy.findByRole('link', { name: /^View referrals with status ‘Investigation pending’$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=INVESTIGATION_PENDING$/)
    cy.findByRole('link', { name: /^View referrals with status ‘Awaiting decision’$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=AWAITING_DECISION$/)
    cy.findByRole('link', { name: /^View referrals with status ‘Plan pending’$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=PLAN_PENDING$/)
    cy.findByRole('link', { name: /^View open CSIPs$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=CSIP_OPEN$/)
    cy.findByRole('link', { name: /^View open CSIPs with review dates in the past$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /manage-csips\?status=CSIP_OPEN&sort=nextReviewDate,asc$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`/`)
  }
})