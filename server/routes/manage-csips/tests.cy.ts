import { expect } from 'chai'
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
  })

  it('tests all use cases', () => {
    cy.task('stubSearchCsipRecords')
    navigateToTestPage()
    cy.url().should('to.match', /\/manage-csips$/)
    checkAxeAccessibility()

    checkSortingAccessibility()

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
    cy.findAllByRole('link', { name: /Page 4 of 4/ })
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
    getQueryInput().clear().type(" Tes'name", { delay: 0 })
    getFilterButton().click()
    getStatusSelect().should('have.value', 'CSIP_OPEN')
    getQueryInput().should('have.value', " Tes'name")
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')

    cy.visit(`manage-csips?sort=nextReviewDate,desc`)
    cy.get('[aria-sort="descending"]').findByText('Next review date').should('exist')

    cy.get('.moj-pagination__item--next > a').eq(0).should('have.text', 'Next Results page')
    cy.get('.moj-pagination__item--next > a > span').eq(0).should('have.text', ' Results page')
    cy.get('.moj-pagination__item--next').eq(0).click()
    cy.get('.moj-pagination__item--prev > a').eq(0).should('have.text', 'Previous Results page')
    cy.get('.moj-pagination__item--prev > a > span').eq(0).should('have.text', ' Results page')

    cy.findAllByRole('link', { name: 'View String, String CSIP record' }).should('be.visible')

    // on clear, all params reset
    getClearLink().click()
    getStatusSelect().and('have.value', '')
    getQueryInput().should('have.value', '')
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')
  })

  it('shows error message and empty result on API failure', () => {
    cy.task('stubSearchCsipRecordsFail')
    navigateToTestPage()
    cy.url().should('to.match', /\/manage-csips/)
    checkAxeAccessibility()

    cy.findAllByRole('heading', { name: /View and manage CSIPs/i }).should('be.visible')

    cy.findByText('Simulated Error for E2E testing').should('be.visible')
    cy.findByText('No results for this search criteria.').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`manage-csips?query=A1234CD`)
  }

  const checkSortingAccessibility = () => {
    cy.get('[aria-sort="ascending"] > a > button')
      .first()
      .should('have.attr', 'tabindex', '-1')
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', 'none')
          return expect(afterStyle).to.have.property('content', 'none')
        })
      })

    cy.get('[aria-sort="ascending"] > a > button > span')
      .first()
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', 'none')
          expect(afterStyle).to.have.property('content', '" ▲"')
          return $el[0].click()
        })
      })

    cy.get('[aria-sort="descending"] > a > button')
      .first()
      .should('have.attr', 'tabindex', '-1')
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', 'none')
          return expect(afterStyle).to.have.property('content', 'none')
        })
      })

    cy.get('[aria-sort="descending"] > a > button > span')
      .first()
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', 'none')
          expect(afterStyle).to.have.property('content', '" ▼"')
          return $el[0].click()
        })
      })

    cy.get('[aria-sort="none"] > a > button')
      .first()
      .should('have.attr', 'tabindex', '-1')
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', 'none')
          return expect(afterStyle).to.have.property('content', 'none')
        })
      })

    cy.get('[aria-sort="none"] > a > button > span')
      .first()
      .within($el => {
        cy.window().then(win => {
          if (!$el?.[0]) return fail()
          const beforeStyle = win.getComputedStyle($el[0], '::before')
          const afterStyle = win.getComputedStyle($el[0], '::after')
          expect(beforeStyle).to.have.property('content', '" ▼"')
          return expect(afterStyle).to.have.property('content', '" ▲"')
        })
      })
  }
})
