import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('test /manage-csips', () => {
  const getFilterButton = () => cy.findByRole('button', { name: /Apply filters/ })
  const getClearLink = () => cy.findByRole('link', { name: /Clear/ })
  const getQueryInput = () => cy.findByRole('textbox', { name: /Name or prison number/ })
  const getStatusSelect = () => cy.findByRole('combobox', { name: /CSIP status/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubGetCaseLoads')
    cy.task('stubSearchCsipRecords')
  })

  it('tests all use cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/manage-csips$/)
    checkAxeAccessibility()

    cy.findAllByRole('heading', { name: /View and manage CSIPs/i }).should('be.visible')

    getFilterButton().should('be.visible')
    getClearLink().should('be.visible')
    getQueryInput().should('be.visible').and('have.value', 'A1234CD')
    getStatusSelect().should('be.visible').and('have.value', '')

    // status labels and overdue review dates are styled
    cy.findAllByText('CSIP open').last().should('have.class', 'govuk-tag--turquoise')
    cy.findAllByText('CSIP closed').last().should('have.class', 'govuk-tag--grey')
    cy.findByText('Overdue Manager').prev().get('span').should('have.class', 'govuk-tag--red')
    cy.findByText('Soon Due Manager').prev().get('span').should('have.class', 'govuk-tag--yellow')

    // on page change, filter and sort persist
    cy.findAllByRole('link', { name: /Page 4 of 100/ })
      .first()
      .click()
    cy.get('[aria-current="page"]').first().should('have.text', '4')
    getQueryInput().should('have.value', 'A1234CD')
    cy.get('[aria-sort="ascending"]').findByText('Name and prison number').should('exist')

    // on sort, filter persist, go to first page
    cy.findByRole('button', { name: /^Name and prison number$/ }).click()
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    getQueryInput().should('have.value', 'A1234CD')
    cy.get('[aria-sort="descending"]').findByText('Name and prison number').should('exist')

    // on status query (url), clear search string and clear sort
    cy.visit(`manage-csips?status=CSIP_CLOSED&page=3`)
    getStatusSelect().should('have.value', 'CSIP_CLOSED')
    getQueryInput().should('have.value', '')
    cy.get('[aria-current="page"]').first().should('have.text', '3')
    cy.get('[aria-sort="descending"]').should('not.exist')

    cy.visit(`manage-csips?sort=nextReviewDate,desc`)
    cy.get('[aria-sort="descending"]').findByText('Next review date').should('exist')

    // on filter, clear sort, go to first page
    getStatusSelect().select('CSIP_OPEN')
    getQueryInput().clear().type(' Testname', { delay: 0 })
    getFilterButton().click()
    getStatusSelect().should('have.value', 'CSIP_OPEN')
    getQueryInput().should('have.value', ' Testname')
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')

    cy.visit(`manage-csips?sort=nextReviewDate,desc`)
    cy.get('[aria-sort="descending"]').findByText('Next review date').should('exist')

    // on clear, all params reset
    getClearLink().click()
    getStatusSelect().and('have.value', '')
    getQueryInput().should('have.value', '')
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`manage-csips?query=A1234CD`)
  }
})
