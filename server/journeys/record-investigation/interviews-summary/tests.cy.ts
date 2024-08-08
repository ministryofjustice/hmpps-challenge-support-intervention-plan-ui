context('test /record-investigation/interviews-summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/interviews-summary$/)
    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByText(/No interview details recorded./).should('be.visible')

    proceedToAddInterview()
    cy.go('back')

    continueToTaskList()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit('/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start')
    cy.url().should('to.match', /\/record-investigation$/)
    cy.findByRole('link', { name: /Interview details/i }).click()
  }

  const proceedToAddInterview = () => {
    cy.findByRole('button', { name: /Add Interview/i }).click()
    cy.url().should('to.match', /\/interview-details$/)
  }

  const continueToTaskList = () => {
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.url().should('to.match', /\/record-investigation$/)
  }
})
