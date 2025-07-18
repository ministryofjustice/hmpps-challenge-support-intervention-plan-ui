context('test /manage-csips', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubSearchCsipRecordsPrisonerCsips')
  })

  it('prisoner not found', () => {
    cy.signIn()
    cy.visit(`/prisoner-csips/A1111AB`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('exist')
  })

  it('prisoner found but user does not have permission', () => {
    cy.task('stubGetPrisonerOutOfCaseLoad')
    cy.signIn()
    cy.visit(`/prisoner-csips/NOCASELOAD`, { failOnStatusCode: false })
    cy.findByText('Page not found').should('exist')
  })

  it('prisoner found and user has permission to see', () => {
    cy.task('stubGetPrisoner')
    cy.signIn()
    cy.visit(`/prisoner-csips/A1111AA?sort=invalid,asc`)

    cy.get('.mini-profile').should('have.length', 1)
    cy.get('.mini-profile-info').children().should('have.length', 5)
    cy.get('.mini-profile-info').within(() => {
      cy.findByText('A1111AA').should('exist')
      cy.findByText('02/02/1932').should('exist')
      cy.findByText('HMP Kirkham').should('exist')
      cy.findByText('A-1-1').should('exist')
      cy.findByText('On remand').should('exist')
    })

    cy.findByText("CSIPs for Tes'name User").should('exist')

    cy.get('.moj-pagination__results')
      .should('have.length', 2)
      .eq(0)
      .should('contain.text', 'Showing 1 to 9 of 100')
      .should('contain.text', 'results')

    // Table headers
    cy.get('.govuk-table > thead > tr > th > a > button').eq(0).should('have.text', 'Name and prison number')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(1).should('have.text', 'Location')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(2).should('have.text', 'Referral date')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(3).should('have.text', 'CSIP log code')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(4).should('have.text', 'Case Manager')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(5).should('have.text', 'Next review date')
    cy.get('.govuk-table > thead > tr > th > a > button').eq(6).should('have.text', 'CSIP status')

    // All statuses are represented in the table
    cy.get('.govuk-table__body > tr > td > strong').eq(0).should('have.text', 'CSIP closed')
    cy.get('.govuk-table__body > tr > td > strong').eq(1).should('have.text', 'CSIP open')
    cy.get('.govuk-table__body > tr > td > strong').eq(2).should('have.text', 'Awaiting decision')
    cy.get('.govuk-table__body > tr > td > strong').eq(3).should('have.text', 'Plan pending')
    cy.get('.govuk-table__body > tr > td > strong').eq(4).should('have.text', 'Investigation pending')
    cy.get('.govuk-table__body > tr > td > strong').eq(5).should('have.text', 'Referral submitted')
    cy.get('.govuk-table__body > tr > td > strong').eq(6).should('have.text', 'Referral pending')
    cy.get('.govuk-table__body > tr > td > strong').eq(7).should('have.text', 'No further action')
    cy.get('.govuk-table__body > tr > td > strong').eq(8).should('have.text', 'Support outside of CSIP')
  })
})
