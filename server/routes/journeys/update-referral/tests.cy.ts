context('test /update-referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should render the update referral screen with more contrib factors available', () => {
    cy.task('stubContribFactors')

    navigateToTestPage()

    goToUpdatePage()

    cy.findByRole('button', { name: /add another contributory factor/i }).should('be.visible')

    checkChangeLinks()
  })

  it('should render the update referral screen with no more contrib factors available', () => {
    cy.task('stubOneContribFactor')

    navigateToTestPage()

    goToUpdatePage()

    cy.findByRole('button', { name: /add another contributory factor/i }).should('not.exist')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
  }

  const goToUpdatePage = () => {
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
    cy.findAllByRole('button', { name: /[\s\S]*screen referral[\s\S]*/i }).should('be.visible')

    cy.findAllByRole('link', { name: /update referral/i })
      .should('be.visible')
      .first()
      .click()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral$/)
    cy.title().should('to.match', /Update a CSIP referral - DPS/)
    cy.findAllByRole('button', { name: /[\s\S]*screen referral[\s\S]*/i }).should('not.exist')
    cy.findByRole('heading', { name: /Update CSIP referral for Testname User/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i }).should('be.visible')
  }

  const checkChangeLinks = () => {
    cy.findByRole('link', { name: /Change if the referral is proactive or reactive/i }).should('be.visible')
    cy.findByRole('link', { name: /Change name of referrer/i }).should('be.visible')
    cy.findByRole('link', { name: /Change area of work/i }).should('be.visible')
    cy.findByRole('link', { name: /Change date of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change time of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change location of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change main concern/i }).should('be.visible')
    cy.findByRole('link', { name: /Change how the prisoner was involved/i }).should('be.visible')
    cy.findByRole('link', { name: /Change if a staff member was assaulted or not/i }).should('be.visible')
    cy.findByRole('link', { name: /Change the description of the behaviour and concerns/i }).should('be.visible')
    cy.findByRole('link', { name: /Change the reasons given for the behaviour/i }).should('be.visible')
    cy.findByRole('link', { name: /Change if Safer Custody are aware of the referral or not/i }).should('be.visible')
    cy.findByRole('link', { name: /Change the additional information relating to the referral/i }).should('be.visible')
  }
})
