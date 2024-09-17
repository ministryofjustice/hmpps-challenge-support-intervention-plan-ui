const title = /Describe the behaviour and the concerns relating to the behaviour/i
const errorMsg = /enter a description of the behaviour and concerns/i

context('test /update-referral/proactive-or-reactive', () => {
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

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the referral details.').should('be.visible')
  }

  it('test description, including all edge cases, proactive', () => {
    cy.task('stubCsipRecordGetSuccess')
    navigateToTestPage()
    checkValuesPersist()
    checkValidation()
    checkDetailsSummary()
    proceedToNextPage()
  })

  it('test description, should show chars left immediately', () => {
    cy.task('stubCsipRecordGetSuccessLongDescription')
    navigateToTestPage()
    cy.contains(/you have 942 characters remaining/i).should('be.visible') // 999 chars minus length of timestamp string
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.findAllByRole('link', { name: /update referral/i })
      .first()
      .click()
    cy.findByRole('link', { name: /Change the description of the behaviour and concerns/i }).click()
  }

  const checkDetailsSummary = () => {
    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    cy.findByText(/a summary of the concerns/i).should('be.visible')
  }

  const checkValuesPersist = () => {
    cy.findByRole('textbox').should('have.value', '')
    cy.findByText(/<script>alert\('concerns'\);<\/script>/).should('be.visible')
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: title }).should('be.visible')
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p').contains(errorMsg).should('be.visible')
    cy.findByRole('link', { name: errorMsg }).should('be.visible').click()
    cy.findByRole('textbox', { name: title }).should('be.focused')

    cy.findByRole('textbox').type(
      'a'.repeat(3774), // prefix + timestamp + 3774 = 4001
      {
        delay: 0,
        force: true,
      },
    )
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)

    // prefix is 166 chars and timestamp length is 61
    cy.findByRole('link', { name: /description must be 3,773 characters or less/i }).should('be.visible')
    cy.contains(/description must be 3,773 characters or less/i).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: title })
      .clear()
      .type(
        'a'.repeat(3000 - 166 - 61), // prefix and timestamp lengths
        {
          delay: 0,
          force: true,
        },
      )
    cy.contains(/you have [0-9]{0,1},?[0-9]{1,3} characters remaining/i).should('not.be.visible')
    cy.findByRole('textbox', { name: title }).type('a')
    cy.contains(/you have 999 characters remaining/i).should('be.visible')
  }
})
