context('test /update-referral/contributory-factors', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should render the update referral screen with more contrib factors available', () => {
    cy.task('stubPatchContributoryFactorSuccess')

    navigateToTestPage()

    goToUpdatePage()

    checkChangingFirstContributoryFactor()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the information on contributory factors.').should('be.visible')

    goToUpdatePage()

    checkChangingSecondContributoryFactor()
  })

  it('should handle API errors', () => {
    cy.task('stubPatchContributoryFactorFail')

    navigateToTestPage()

    goToUpdatePage()

    checkChangingFirstContributoryFactor()

    cy.url().should(
      'to.match',
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/b8dff21f-e96c-4240-aee7-28900dd910f2-factorType#contributoryFactor$/,
    )

    cy.findByText('Simulated Error for E2E testing').should('be.visible')
    cy.findByRole('radio', { name: /factor5/i }).should('be.checked')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
  }

  const goToUpdatePage = () => {
    cy.findAllByRole('link', { name: /update referral/i })
      .should('be.visible')
      .first()
      .click()
  }

  const checkChangingFirstContributoryFactor = () => {
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i }).click()
      })

    cy.url().should(
      'to.match',
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/b8dff21f-e96c-4240-aee7-28900dd910f2-factorType#contributoryFactor$/,
    )
    cy.findByRole('heading', { name: /Change the contributory factor/ }).should('be.visible')
    cy.findByText('Update a CSIP referral').should('be.visible')

    cy.findByRole('radio', { name: /factor1/i }).should('have.focus')
    cy.findByRole('radio', { name: /factor5/i }).click()

    cy.findByRole('link', { name: /cancel/i })
    cy.findByRole('button', { name: /confirm and save/i }).click()
  }

  const checkChangingSecondContributoryFactor = () => {
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i }).click()
      })

    cy.url().should(
      'to.match',
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/b8dff21f-e96c-4240-aee7-28900dd910f1-factorType#contributoryFactor-2$/,
    )

    cy.findByRole('radio', { name: /factor3/i }).should('have.focus')
  }
})
