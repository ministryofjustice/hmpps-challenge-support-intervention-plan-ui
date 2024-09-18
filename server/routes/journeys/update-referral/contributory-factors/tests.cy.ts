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
    cy.task('stubCsipRecordPatchSuccess')
  })

  it('should render the update referral screen with more contrib factors available', () => {
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    goToUpdatePage()

    checkChangingFirstContributoryFactor()

    goToUpdatePage()

    checkChangingSecondContributoryFactor()
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
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/b8dff21f-e96c-4240-aee7-28900dd910f2-factorType#contributoryFactors$/,
    )
    cy.findByRole('heading', { name: /Change the contributory factor/ }).should('be.visible')
    cy.findByText('Update a CSIP referral').should('be.visible')

    cy.findByRole('radio', { name: /factor1/i }).should('have.focus')

    cy.findByRole('link', { name: /cancel/i })
    cy.findByRole('button', { name: /confirm and save/i }).click()

    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the information on contributory factors.').should('be.visible')
  }

  const checkChangingSecondContributoryFactor = () => {
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i }).click()
      })

    cy.url().should(
      'to.match',
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/b8dff21f-e96c-4240-aee7-28900dd910f1-factorType#contributoryFactors-2$/,
    )

    cy.findByRole('radio', { name: /factor3/i }).should('have.focus')
  }
})
