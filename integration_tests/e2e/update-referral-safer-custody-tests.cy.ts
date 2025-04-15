import { checkAxeAccessibility } from '../support/accessibilityViolations'

context('test /update-referral/safer-custody', () => {
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

    cy.title().should(
      'equal',
      `Is the Safer Custody team already aware of this referral? - Update a CSIP referral - DPS`,
    )
    cy.url().should('to.match', /\/update-referral\/safer-custody#isSaferCustodyTeamInformed$/)
    checkAxeAccessibility()

    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)

    checkInputsArePrepopulated()

    proceedToNextPage()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('link', { name: /Change if Safer Custody are aware of the referral or not/i }).click()
  }

  const checkInputsArePrepopulated = () => {
    cy.findByRole('radio', { name: /Yes$/i }).should('be.checked')
  }

  const proceedToNextPage = () => {
    cy.findByRole('radio', { name: /No$/i }).click()
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the additional information.').should('be.visible')
  }
})
