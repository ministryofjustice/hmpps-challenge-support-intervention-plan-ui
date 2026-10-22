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
    cy.findByText('How to use the Suggested Case Notes').should('be.visible')
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

  context('when toggling highlights', () => {
    const highlightedMark = () => cy.get('[data-qa="suggested-case-notes-card"] mark.hods-highlight').first()

    it('shows highlighted text and a button to turn highlights off', () => {
      cy.task('stubSuggestedCaseNotes')
      navigateToTestPage()

      cy.get('[data-qa="suggested-case-notes-card"] mark').should('contain.text', 'verbal altercation')
      highlightedMark().should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      cy.get('[data-qa="suggested-case-notes-widget"]').should('not.have.class', 'suggested-case-notes--no-highlights')
      cy.get('button[data-qa="toggle-highlights"]').should('have.text', 'Turn off highlights')
    })

    it('shows unhighlighted text and a button to turn highlights on', () => {
      cy.task('stubSuggestedCaseNotes')
      navigateToTestPage()
      cy.visit(`${uuid}/record-investigation/usual-behaviour-presentation?suggestedCaseNotesHighlighting=off`)

      cy.get('[data-qa="suggested-case-notes-widget"]').should('have.class', 'suggested-case-notes--no-highlights')
      highlightedMark().should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      cy.get('button[data-qa="toggle-highlights"]').should('have.text', 'Turn on highlights')
    })

    it('toggles highlights without reloading the page and keeps focus on the toggle', () => {
      cy.task('stubSuggestedCaseNotes')
      navigateToTestPage()
      cy.window().then(win => {
        Object.assign(win, { highlightToggleNoReload: true })
      })

      cy.get('button[data-qa="toggle-highlights"]').focus().click()
      cy.get('[data-qa="suggested-case-notes-widget"]').should('have.class', 'suggested-case-notes--no-highlights')
      highlightedMark().should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      cy.get('button[data-qa="toggle-highlights"]').should('have.text', 'Turn on highlights').and('be.focused')
      cy.location('search').should('include', 'suggestedCaseNotesHighlighting=off')

      cy.get('button[data-qa="toggle-highlights"]').click()
      cy.get('[data-qa="suggested-case-notes-widget"]').should('not.have.class', 'suggested-case-notes--no-highlights')
      cy.get('button[data-qa="toggle-highlights"]').should('have.text', 'Turn off highlights').and('be.focused')
      cy.location('search').should('include', 'suggestedCaseNotesHighlighting=on')

      cy.window().its('highlightToggleNoReload').should('equal', true)
    })

    context('when suggested case notes are shown', () => {
      const shouldHaveCardOrder = (expected: string[]) =>
        cy.get('[data-qa="suggested-case-notes-card"]').should($cards => {
          const order = Cypress._.map($cards, card =>
            card.querySelector('[data-truncatable-content]')!.textContent!.trim().split(/\s+/).slice(0, 2).join(' '),
          )
          assert.deepEqual(order, expected)
        })

      beforeEach(() => {
        cy.task('stubSuggestedCaseNotesForSorting')
        navigateToTestPage()
        cy.window().then(win => {
          Object.assign(win, { sortNoReload: true })
        })
      })

      it('reorders case notes in place and keeps focus on the sort control', () => {
        shouldHaveCardOrder(['Newest created', 'Older note', 'Oldest note'])

        cy.get('button[data-qa="sort-by-most-recent-activity"]').focus().click()

        shouldHaveCardOrder(['Older note', 'Oldest note', 'Newest created'])
        cy.get('button[data-qa="sort-by-most-recent-activity"]')
          .should('have.text', 'Sorted by recently updated')
          .and('be.focused')
        cy.get('button[data-qa="sort-by-date-created"]').should('have.text', 'Sort by date created')
        cy.get('[data-qa="suggested-case-notes-status"]').should('have.text', 'Case notes sorted by recently updated')
        cy.location('search').should('include', 'sortField=lastAmendedDate')

        cy.get('button[data-qa="sort-by-date-created"]').click()
        shouldHaveCardOrder(['Newest created', 'Older note', 'Oldest note'])
        cy.location('search').should('include', 'sortField=createdDate')

        cy.window().its('sortNoReload').should('equal', true)
      })

      it('keeps the highlighting setting and expanded case notes when sorting', () => {
        cy.get('button[data-qa="toggle-highlights"]').click()
        cy.get('[data-qa="expand-case-note"]').first().click().should('have.attr', 'aria-expanded', 'true')

        cy.get('button[data-qa="sort-by-most-recent-activity"]').click()

        cy.get('[data-qa="suggested-case-notes-widget"]').should('have.class', 'suggested-case-notes--no-highlights')
        cy.get('button[data-qa="toggle-highlights"]').should('have.text', 'Turn on highlights')
        cy.get('[data-qa="suggested-case-notes-card"]')
          .last()
          .find('[data-qa="expand-case-note"]')
          .should('have.attr', 'aria-expanded', 'true')
        cy.location('search').should('include', 'sortField=lastAmendedDate')
        cy.location('search').should('include', 'suggestedCaseNotesHighlighting=off')
        cy.window().its('sortNoReload').should('equal', true)

        cy.reload()
        cy.get('[data-qa="suggested-case-notes-widget"]').should('have.class', 'suggested-case-notes--no-highlights')
        cy.get('button[data-qa="sort-by-most-recent-activity"]').should('have.text', 'Sorted by recently updated')
      })
    })
  })

  context('when truncating suggested case notes', () => {
    beforeEach(() => {
      cy.task('stubSuggestedCaseNotesLong')
      navigateToTestPage()
    })

    it('truncates long notes and amendments and expands the whole card', () => {
      cy.get('[data-qa="suggested-case-notes-card"]')
        .first()
        .within(() => {
          cy.get('[data-truncatable-text]').should('have.length', 2)
          cy.get('[data-truncatable-text]').first().should('have.class', 'case-note-card__text-wrapper--truncated')
          cy.get('[data-truncatable-text]').first().should('contain.text', 'important highlighted behaviour')
          cy.get('[data-truncatable-text]').first().should('contain.text', '…')
          cy.get('[data-qa="expand-case-note"]').should('have.text', 'Expand case note').click()
          cy.get('[data-truncatable-text]').should('not.have.class', 'case-note-card__text-wrapper--truncated')
          cy.get('[data-qa="expand-case-note"]').should('have.attr', 'aria-expanded', 'true')
          cy.get('[data-qa="expand-case-note"]').should('have.text', 'Minimise case note').click()
          cy.get('[data-truncatable-text]').first().should('have.class', 'case-note-card__text-wrapper--truncated')
          cy.get('[data-qa="expand-case-note"]').should('have.attr', 'aria-expanded', 'false')
        })
    })

    it('expands and minimises all eligible case notes', () => {
      cy.get('[data-qa="expand-all-case-notes"]').should('be.visible').click()
      cy.get('[data-qa="expand-all-case-notes"]')
        .should('have.text', 'Minimise all case notes')
        .and('have.attr', 'aria-expanded', 'true')
      cy.get('[data-qa="expand-case-note"]').should('have.attr', 'aria-expanded', 'true')

      cy.get('[data-qa="expand-all-case-notes"]').click()
      cy.get('[data-qa="expand-all-case-notes"]')
        .should('have.text', 'Expand all case notes')
        .and('have.attr', 'aria-expanded', 'false')
      cy.get('[data-qa="expand-case-note"]').should('have.attr', 'aria-expanded', 'false')
    })
  })
})
