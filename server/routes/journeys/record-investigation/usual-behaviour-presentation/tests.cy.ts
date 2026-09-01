import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/usual-behaviour-presentation', () => {
  const uuid = uuidV4()

  const getInputTextbox = () =>
    cy.findByRole('textbox', { name: "What is Tes'name User’s usual behaviour presentation?" })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

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
    cy.url().should('to.match', /\/usual-behaviour-presentation$/)
    cy.title().should(
      'equal',
      'What’s the prisoner’s usual behaviour presentation? - Record a CSIP investigation - DPS',
    )
    checkAxeAccessibility()

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()
  })

  const navigateToTestPage = (sortField?: 'createdDate' | 'lastAmendedDate') => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /\/record-investigation$/)
    cy.visit(`${uuid}/record-investigation/usual-behaviour-presentation${sortField ? `?sortField=${sortField}` : ''}`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: "What is Tes'name User’s usual behaviour presentation?" }).should('be.visible')
    cy.findByText(/Where to find information on a prisoner’s usual behaviour presentation/).should('be.visible')
    getInputTextbox().should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /record-investigation$/)
  }

  const validateErrorMessage = () => {
    getContinueButton().click()
    cy.title().should(
      'equal',
      'Error: What’s the prisoner’s usual behaviour presentation? - Record a CSIP investigation - DPS',
    )
    cy.findByRole('link', { name: /Enter a description of the prisoner’s usual behaviour presentation/i })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', {
      name: /Description of the prisoner’s usual behaviour presentation must be 4,000 characters or less/i,
    })
      .should('be.visible')
      .click()
    getInputTextbox().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)

    cy.pageCheckCharacterThresholdMessage(getInputTextbox(), 4000)
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>", { delay: 0 })
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /record-investigation$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getInputTextbox().should('have.value', "<script>alert('xss');</script>")
  }

  it('should show the empty state message when there are no suggested case notes', () => {
    cy.task('stubSuggestedCaseNotesEmpty')
    navigateToTestPage()
    cy.url().should('to.match', /\/usual-behaviour-presentation$/)

    cy.get('[data-qa="suggested-case-notes-empty-message"]')
      .should('be.visible')
      .and('contain.text', 'No suggested case notes are available for this record right now.')
  })

  it('should not show the empty state message when suggested case notes exist', () => {
    cy.task('stubSuggestedCaseNotes')
    navigateToTestPage()
    cy.url().should('to.match', /\/usual-behaviour-presentation$/)

    cy.get('[data-qa="suggested-case-notes-empty-message"]').should('not.exist')
  })

  context('when sorting suggested case notes', () => {
    it('should update both link texts and the query string when sorting by date created', () => {
      navigateToTestPage('lastAmendedDate')
      cy.url().should('include', 'sortField=lastAmendedDate')
      cy.get('[data-qa="sort-by-date-created"]').should('have.text', 'Sort by date created')
      cy.get('[data-qa="sort-by-most-recent-activity"]').should('have.text', 'Sorted by most recent activity')

      cy.get('[data-qa="sort-by-date-created"]').should('be.visible').click()

      cy.url().should('include', 'sortField=createdDate')
      cy.get('[data-qa="sort-by-date-created"]').should('have.text', 'Sorted by date created')
      cy.get('[data-qa="sort-by-most-recent-activity"]').should('have.text', 'Sort by most recent activity')
    })

    it('should update both link texts and the query string when sorting by most recent activity', () => {
      navigateToTestPage('createdDate')
      cy.url().should('include', 'sortField=createdDate')
      cy.get('[data-qa="sort-by-date-created"]').should('have.text', 'Sorted by date created')
      cy.get('[data-qa="sort-by-most-recent-activity"]').should('have.text', 'Sort by most recent activity')

      cy.get('[data-qa="sort-by-most-recent-activity"]').should('be.visible').click()

      cy.url().should('include', 'sortField=lastAmendedDate')
      cy.get('[data-qa="sort-by-date-created"]').should('have.text', 'Sort by date created')
      cy.get('[data-qa="sort-by-most-recent-activity"]').should('have.text', 'Sorted by most recent activity')
    })
  })
})
