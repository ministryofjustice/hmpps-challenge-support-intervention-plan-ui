import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('Make a Referral Journey', () => {
  const uuid = '12e5854f-f7b1-4c56-bec8-69e390eb8550'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
  })

  it('should show already on a csip notification if prisoner is already on a csip', () => {
    cy.task('stubCurrentCsipStatusOnCsip')
    setupDataSignInAndGo()

    cy.findByRole('heading', { name: /tes'name user is already on a csip/i }).should('be.visible')
    cy.findByRole('link', { name: /view csip details for tes'name user/i }).should('be.visible')
    cy.findByRole('link', { name: /view csip details for tes'name user/i })
      .should('have.attr', 'href')
      .and('match', /manage-csips\?query=A1111AA/)
  })

  it('should show a notification if prisoner already has a referral', () => {
    cy.task('stubCurrentCsipStatusExistingReferral')
    setupDataSignInAndGo()

    cy.findByRole('heading', { name: /a referral is already in progress for tes'name user/i }).should('be.visible')
    cy.findByRole('link', { name: /view csip details for tes'name user/i }).should('be.visible')
    cy.findByRole('link', { name: /view csip details for tes'name user/i })
      .should('have.attr', 'href')
      .and('match', /manage-csips\?query=A1111AA/)
  })

  it('test involvement, including all edge cases', () => {
    setupDataSignInAndGo()

    cy.get('.govuk-back-link')
      .eq(0)
      .should('have.attr', 'href', 'http://localhost:3001/prisoner/A1111AA')
      .should('have.text', 'Back to prisoner profile')

    cy.findByRole('heading', { name: /make a csip referral/i }).should('be.visible')
    cy.findByText(/are you making this referral on someone else’s behalf\?/i).should('be.visible')

    cy.findByRole('heading', { name: /tes'name user is already on a csip/i }).should('not.exist')

    checkAxeAccessibility()

    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /select if you’re making this referral on someone else’s behalf or not/i }).should(
      'be.visible',
    )

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')

    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('radio', { name: /no/i }).should('be.checked')

    injectJourneyDataAndReload(uuid, {
      isCheckAnswers: true,
    })

    cy.get('.govuk-back-link').eq(0).should('have.attr', 'href', 'check-answers').should('have.text', 'Back')
  })

  const setupDataSignInAndGo = () => {
    cy.signIn()
    cy.visit(`${uuid}/prisoners/A1111AA/referral/start`)
    cy.url().should('include', 'on-behalf-of')
  }
})
