context('test /update-referral/details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubContribFactors')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubCsipRecordPatchSuccess')
  })

  it('should try out different cases', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/update-referral\/details#incidentTime$/)

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
    cy.findByRole('link', { name: /Change time of occurrence/i }).click()
  }

  const checkInputsArePrepopulated = () => {
    cy.findByRole('textbox', { name: /date of occurrence/i }).should('have.value', '25/12/2024')
    cy.findByRole('textbox', { name: /hour/i }).should('have.value', '23')
    cy.findByRole('textbox', { name: /minute/i }).should('have.value', '59')
    cy.findByRole('combobox', { name: /where was the most recent occurrence of the behaviour\?/i }).should(
      'have.value',
      'A',
    )
    cy.findByRole('combobox', { name: /what’s the main concern\?/i }).should('have.value', 'A')
  }

  const checkValidationError = () => {
    cy.findByRole('textbox', { name: /date of occurrence/i }).clear()
    cy.findByRole('textbox', { name: /minute/i }).clear()
    cy.findByRole('button', { name: /Confirm and save/i })
      .should('be.visible')
      .click()

    cy.findByRole('link', { name: /Enter the date of the most recent occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Enter a time using the 24-hour clock/i }).should('be.visible')
  }

  const proceedToNextPage = () => {
    cy.findByRole('textbox', { name: /date of occurrence/i }).type('25/12/2001', { delay: 0 })
    cy.findByRole('textbox', { name: /minute/i }).type('00')
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the behaviour details.').should('be.visible')
  }
})
