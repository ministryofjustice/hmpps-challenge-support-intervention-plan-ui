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

    // on page change, filter and sort persist
    cy.findAllByRole('link', { name: /Page 4 of 100/ })
      .first()
      .click()
    cy.url().should('to.match', /\/manage-csips\?page=4$/)
    getQueryInput().should('have.value', 'A1234CD')
    cy.get('[aria-sort="ascending"]').findByText('Name and prison number').should('exist')

    // on sort, filter persist, go to first page
    cy.findByRole('button', { name: /^Name and prison number$/ }).click()
    cy.url().should('to.match', /\/manage-csips$/)
    getQueryInput().should('have.value', 'A1234CD')
    cy.get('[aria-sort="descending"]').findByText('Name and prison number').should('exist')

    // on filter, clear sort, go to first page
    cy.findAllByRole('link', { name: /Page 4 of 100/ })
      .first()
      .click()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`manage-csips?query=A1234CD`)
  }
})
