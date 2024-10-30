import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /update-referral/involvement', () => {
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
  })

  it('should try out different cases', () => {
    navigateToTestPage()

    cy.title().should('equal', `Behaviour involvement - Update a CSIP referral - DPS`)
    cy.url().should('to.match', /\/update-referral\/involvement#involvementType$/)
    checkAxeAccessibility()

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    checkInputsArePrepopulated()

    checkValidationError()

    proceedToNextPage()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('link', { name: /Change how the prisoner was involved/i }).click()
  }

  const checkInputsArePrepopulated = () => {
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).should(
      'have.value',
      '<script>alert("Staff Name")</script>',
    )
    cy.findByRole('radio', { name: /factor1/i }).should('be.checked')
  }

  const checkValidationError = () => {
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
    cy.findByRole('button', { name: /Confirm and save/i })
      .should('be.visible')
      .click()

    cy.findByRole('link', { name: /Enter the names of staff assaulted/i }).should('be.visible')
  }

  const proceedToNextPage = () => {
    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the behaviour involvement information.').should('be.visible')
  }
})
