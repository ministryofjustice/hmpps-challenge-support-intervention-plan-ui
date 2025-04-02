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
    cy.task('stubStatus')

    // All stubs should be available to all tests to ensure API query params are correctly constructed
    cy.task('stubSearchCsipRecords')
    cy.task('stubSearchCsipRecordsClosed')
    cy.task('stubSearchCsipRecordsOpen')
    cy.task('stubSearchCsipRecordsPlans')
    cy.task('stubSearchCsipRecordsReferrals')
  })

  it('tests all use cases', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    checkSortingAccessibility()

    cy.findAllByRole('heading', { name: /CSIP Caseload/i }).should('be.visible')

    cy.get('.light-box > ul > li > a').should('have.length', 2)
    cy.get('.light-box > ul > li > a').eq(0).should('have.text', 'Plans only')
    cy.get('.light-box > ul > li > a').eq(1).should('have.text', 'Referrals in progress only')

    getFilterButton().should('be.visible')
    getClearLink().should('be.visible')
    getQueryInput().should('be.visible').and('have.value', 'A1234CD')
    getStatusSelect().should('be.visible').and('have.value', '')

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

    // status labels and overdue review dates are styled
    cy.get('.govuk-table__body > tr > td > strong').eq(1).should('have.class', 'govuk-tag--turquoise')
    cy.get('.govuk-table__body > tr > td > strong').eq(0).should('have.class', 'govuk-tag--grey')
    cy.get('.govuk-table__body > tr > td > span').eq(2).should('have.class', 'govuk-tag--red')
    cy.get('.govuk-table__body > tr > td > span').eq(1).should('have.class', 'govuk-tag--yellow')

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
    getQueryInput().should('have.value', "Tes'name")
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')

    cy.visit(`manage-csips?sort=nextReviewDate,desc`)
    cy.get('[aria-sort="descending"]').findByText('Next review date').should('exist')

    cy.get('.moj-pagination__item--next > a').eq(0).should('have.text', 'Next Results page')
    cy.get('.moj-pagination__item--next > a > span').eq(0).should('have.text', ' Results page')
    cy.get('.moj-pagination__item--next').eq(0).click()
    cy.get('.moj-pagination__item--prev > a').eq(0).should('have.text', 'Previous Results page')
    cy.get('.moj-pagination__item--prev > a > span').eq(0).should('have.text', ' Results page')

    cy.findAllByRole('link', { name: 'View Smith, John CSIP record' }).should('be.visible')

    cy.get('.govuk-table__body > tr').children().eq(3).should('have.text', 'LEI123')

    // on clear, all params reset
    getClearLink().click()
    getStatusSelect().and('have.value', '')
    getQueryInput().should('have.value', '')
    cy.get('[aria-current="page"]').first().should('have.text', '1')
    cy.get('[aria-sort="descending"]').should('not.exist')
  })

  it('should show relevant content for Manage Plans', () => {
    navigateToTestPage()
    cy.visit(`manage-plans`)

    cy.findAllByRole('heading', { name: /Open and closed CSIPs/i }).should('be.visible')

    cy.findAllByRole('heading', { name: /Change view/i }).should('be.visible')

    cy.get('.light-box > ul > li > a').should('have.length', 2)
    cy.get('.light-box > ul > li > a').eq(0).should('have.text', 'All of the CSIP caseload')
    cy.get('.light-box > ul > li > a').eq(1).should('have.text', 'Referrals in progress only')

    getStatusSelect().should('be.visible').children().should('have.length', 3)
    getStatusSelect().children().eq(0).should('have.text', 'All open and closed CSIPs')
    getStatusSelect().children().eq(1).should('have.text', 'CSIP closed')
    getStatusSelect().children().eq(2).should('have.text', 'CSIP open')

    cy.get('.govuk-table__body > tr').should('have.length', 2)

    // "ALL" statuses means only CSIP closed and CSIP open are shown
    cy.get('.govuk-table__body > tr > td > strong').eq(0).should('have.text', 'CSIP closed')
    cy.get('.govuk-table__body > tr > td > strong').eq(1).should('have.text', 'CSIP open')
  })

  it('should show relevant content for Manage Referrals', () => {
    navigateToTestPage()
    cy.visit(`manage-referrals`)

    cy.findAllByRole('heading', { name: /CSIP referrals in progress/i }).should('be.visible')

    cy.get('.light-box > ul > li > a').should('have.length', 2)
    cy.get('.light-box > ul > li > a').eq(0).should('have.text', 'All of the CSIP caseload')
    cy.get('.light-box > ul > li > a').eq(1).should('have.text', 'Plans only')

    getStatusSelect().should('be.visible').children().should('have.length', 6)
    getStatusSelect().children().eq(0).should('have.text', 'All referrals in progress')
    getStatusSelect().children().eq(1).should('have.text', 'Awaiting decision')
    getStatusSelect().children().eq(2).should('have.text', 'Investigation pending')
    getStatusSelect().children().eq(3).should('have.text', 'Plan pending')
    getStatusSelect().children().eq(4).should('have.text', 'Referral pending')
    getStatusSelect().children().eq(5).should('have.text', 'Referral submitted')

    cy.get('.govuk-table__body > tr').should('have.length', 5)
    cy.get('.govuk-table__body > tr').children().eq(4).should('have.text', 'Abuse')

    // "ALL" statuses means only in progress referral types are shown
    cy.get('.govuk-table__body > tr > td > strong').eq(0).should('have.text', 'Awaiting decision')
    cy.get('.govuk-table__body > tr > td > strong').eq(1).should('have.text', 'Plan pending')
    cy.get('.govuk-table__body > tr > td > strong').eq(2).should('have.text', 'Investigation pending')
    cy.get('.govuk-table__body > tr > td > strong').eq(3).should('have.text', 'Referral submitted')
    cy.get('.govuk-table__body > tr > td > strong').eq(4).should('have.text', 'Referral pending')
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
