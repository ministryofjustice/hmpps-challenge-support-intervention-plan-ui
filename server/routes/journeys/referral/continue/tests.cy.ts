const continueNext = () => cy.findByRole('button', { name: /continue/i }).click()

context('test /csip-record/:recordUuid/referral/start', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordPostSuccess')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
  })

  it('should set on behalf of to no due to display name matching referredBy', () => {
    cy.task('stubCsipRecordGetSuccessReferralPending')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`, { failOnStatusCode: false })
    cy.findByText(/This referral is incomplete./).should('be.visible')
    cy.findAllByRole('button', { name: /Complete referral/i })
      .first()
      .click()

    cy.url().should('to.match', /\/referral\/on-behalf-of$/)
    cy.findByRole('radio', { name: /no/i }).should('be.checked')
  })

  it('should populate the entirety of the referral, with all values being set properly', () => {
    cy.task('stubCsipRecordGetSuccessReferralPendingMatchingReferrer')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`, { failOnStatusCode: false })
    cy.findByText(/This referral is incomplete./).should('be.visible')
    cy.findByRole('link', { name: /update a referral/i }).should('not.exist')
    cy.findAllByRole('button', { name: /Complete referral/i })
      .first()
      .click()

    cy.url().should('to.match', /\/referral\/on-behalf-of$/)
    cy.findByRole('radio', { name: /no/i }).should('not.be.checked')
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    continueNext()

    cy.url().should('to.match', /\/referral\/referrer$/)
    cy.findByDisplayValue('John Smith').should('be.visible')
    cy.findByDisplayValue('AreaA').should('be.visible')
    continueNext()

    cy.url().should('to.match', /\/referral\/proactive-or-reactive$/)
    cy.findByRole('radio', { name: /proactive/i }).should('be.checked')
    continueNext()

    cy.url().should('to.match', /\/referral\/details$/)
    cy.findByDisplayValue('1/1/2024').should('be.visible')
    cy.findByDisplayValue('23').should('be.visible')
    cy.findByDisplayValue('59').should('be.visible')
    cy.findByDisplayValue('LocationA').should('be.visible')
    cy.findByDisplayValue('TypeA').should('be.visible')
    continueNext()

    cy.url().should('to.match', /\/referral\/involvement$/)
    cy.findByRole('radio', { name: /Factor1/i }).should('be.checked')
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    cy.findByDisplayValue('<script>alert("Staff Name")</script>').should('be.visible')
    continueNext()

    cy.url().should('to.match', /\/referral\/description$/)
    cy.findByDisplayValue(/<button>this button should be escaped<\/button>/).should('be.visible')
    continueNext()

    cy.url().should('to.match', /\/referral\/reasons$/)
    cy.findByDisplayValue(/<button>also should be escaped<\/button>/).should('be.visible')
    continueNext()

    cy.url().should('to.match', /\/referral\/contributory-factors$/)
    cy.findByRole('checkbox', { name: /Factor1/i }).should('be.checked')
    cy.findByRole('checkbox', { name: /Factor3/i }).should('be.checked')
    cy.findByRole('checkbox', { name: /Factor4/i }).should('be.checked')
    continueNext()

    cy.url().should('to.match', /\/referral\/contributory-factors-comments$/)
    cy.findByText(/<button>factor comment button should be escaped<\/button>/).should('be.visible')
    cy.findAllByRole('link', { name: /add comment/i }).should('have.length', 2)
    continueNext()

    cy.url().should('to.match', /\/referral\/safer-custody$/)
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    continueNext()

    cy.url().should('to.match', /\/referral\/additional-information$/)
    cy.findByDisplayValue(/<button>otherinfo button should be escaped<\/button>/).should('be.visible')
    continueNext()
  })
})
