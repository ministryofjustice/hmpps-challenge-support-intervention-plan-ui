context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
  })

  it('test area-of-work, including all edge cases', () => {
    setupDataSignInAndGo()

    checkValidation()

    checkValuesPersist()
  })

  const checkValuesPersist = () => {
    cy.findByRole('combobox', { name: /which area do you work in\?/i }).select(1)
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('combobox', { name: /which area do you work in\?/i }).should('have.value', 'A')
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: /which area do you work in\?/i }).should('be.visible')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /select your area of work/i }).should('be.visible')
    cy.contains('p', /select your area of work/i).should('be.visible')
  }

  const setupDataSignInAndGo = () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')
    cy.url().should('include', 'on-behalf-of')
    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
  }
})
