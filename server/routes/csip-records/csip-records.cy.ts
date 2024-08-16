context('test /record-investigation/interviews-summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
  })

  it('should render a post-investigation, pre decision csip record', () => {
    cy.task('stubCsipRecordSuccessAwaitingDecision')

    navigateToTestPage()

    checkInvestigationDetailsExist()

    checkTabsAndReferral()
  })

  it('should render a post-screen, pre-investigation csip record', () => {
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findAllByRole('button', { name: /screen referral/i }).should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
  }

  const checkInvestigationDetailsExist = () => {
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)

    cy.findAllByRole('button', { name: /[\s\S]*record decision[\s\S]*/i }).should('be.visible')
    cy.findByRole('heading', { name: /investigation$/i }).should('be.visible')
    cy.findByRole('heading', { name: /investigation information/i }).should('be.visible')
    cy.findByText('22 July 2024').should('be.visible')
    cy.findByText('staff stafferson').should('be.visible')
    cy.findByText('SomeVidence').should('be.visible')
    cy.findByText('bananas').should('be.visible')
    cy.findByText('a great person').should('be.visible')
    cy.findByText('spiders').should('be.visible')
    cy.findByText('SomeFactors').should('be.visible')

    cy.findByRole('heading', { name: /interview details/i }).should('be.visible')
    cy.findByRole('heading', { name: /Interview with Some Person/ }).should('be.visible')
    cy.findByText('Some Person').should('be.visible')
    cy.findByText('25 December 2024').should('be.visible')
    cy.findByText('Witness').should('be.visible')
    cy.findByText('some text').should('be.visible')
  }

  const checkTabsAndReferral = () => {
    cy.findByRole('link', { name: /investigation/i }).should('be.visible')
    cy.findByRole('link', { name: /investigation/i, current: 'page' }).should('be.visible')

    cy.findByRole('link', { name: /referral/i })
      .should('be.visible')
      .click()
    cy.findByRole('link', { name: /referral/i, current: 'page' }).should('be.visible')
  }
})
