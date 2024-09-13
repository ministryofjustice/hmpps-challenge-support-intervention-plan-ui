import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-referral/referrer', () => {
  const START_URL = `csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`

  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })
  const getReferredBy = () => cy.findByRole('textbox', { name: 'What is the referrer’s name?' })
  const getAreaOfWork = () => cy.findByRole('combobox', { name: 'Which area do they work in?' })

  const resetInputs = () => {
    getReferredBy().clear()
    getAreaOfWork().select('Select area')
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubCsipRecordPatchSuccess')
    cy.task('stubAreaOfWork')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('link', { name: /Change area of work/i }).click()

    checkAxeAccessibility()
    checkInputsArePrepopulated()
    validatePageContents()

    validateErrorsMandatory()

    validateErrorMessagesTextInputTooLong()

    completeInputs()

    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the behaviour details.').should('be.visible')
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Referrer details' }).should('be.visible')

    cy.findByText('Update a CSIP referral').should('be.visible')

    cy.findByRole('textbox', { name: 'What is the referrer’s name?' }).should('be.visible')

    cy.findByText('If the referrer is a prisoner, select ‘Other’.').should('be.visible')

    getAreaOfWork().should('be.visible')

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorsMandatory = () => {
    resetInputs()
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the referrer’s name/i })
      .should('be.visible')
      .click()
    getReferredBy().should('be.focused').should('have.value', '')
    cy.findAllByText('Enter the referrer’s name').should('have.length', 2)

    cy.findByRole('link', { name: /Select the referrer’s area of work/i })
      .should('be.visible')
      .click()
    getAreaOfWork().should('be.focused')
    cy.findAllByText('Select the referrer’s area of work').should('have.length', 2)
  }

  const validateErrorMessagesTextInputTooLong = () => {
    resetInputs()

    getReferredBy().type('a'.repeat(241), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Referrer’s name must be 240 characters or less/i })
      .should('be.visible')
      .click()
    getReferredBy().should('be.focused')
    getReferredBy().should('have.value', 'a'.repeat(241))
  }

  const completeInputs = () => {
    resetInputs()

    getReferredBy().type('textarea input', { delay: 0 })

    getAreaOfWork().select('AreaA')
  }

  const checkInputsArePrepopulated = () => {
    getAreaOfWork().should('have.value', 'A')
    getReferredBy().should('have.value', '<script>alert("Test User")</script>')
  }
})
