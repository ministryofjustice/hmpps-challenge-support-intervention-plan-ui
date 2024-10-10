import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /update-investigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
  })

  it('should render the update investigation screen', () => {
    cy.task('stubCsipRecordSuccessAwaitingDecision')
    navigateToTestPage()

    goToUpdatePage()
    checkAxeAccessibility()
    cy.findByRole('button', { name: /add another interview/i }).should('be.visible')

    checkInterviews()
    checkChangeLinks()
  })

  it('should render the update investigation screen with no interviews', () => {
    cy.task('stubCsipRecordSuccessAwaitingDecisionNoInterviews')
    navigateToTestPage()

    goToUpdatePage()

    cy.findByRole('button', { name: /add interview/i }).should('be.visible')

    cy.findByText('No interview details recorded.').should('be.visible')
    cy.get('.govuk-summary-card').should('have.length', 0)
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordGetSuccessAfterScreeningACCT')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })

  const checkInterviews = () => {
    cy.get('.govuk-summary-card').should('have.length', 2)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: /interview with some person/i }).should('be.visible')
        cy.get('dd').contains('Some Person').should('be.visible')
        cy.findByRole('link', { name: /change the interviewee's name \(interview with some person\)/i }).should(
          'be.visible',
        )
        cy.findByRole('link', {
          name: /change the interview date for the interview with some person \(interview with some person\)/i,
        }).should('be.visible')
        cy.findByRole('link', {
          name: /change the role for some person/i,
        }).should('be.visible')
        cy.findByRole('link', {
          name: /change the comments about the interview with some person \(interview with some person\)/i,
        }).should('be.visible')
      })

    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('heading', { name: /interview with another person/i }).should('be.visible')
        cy.get('dd').contains('Another Person').should('be.visible')
      })
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
  }

  const goToUpdatePage = () => {
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /[\s\S]*record decision[\s\S]*/i }).should('be.visible')

    cy.findAllByRole('link', { name: /update investigation/i })
      .should('be.visible')
      .first()
      .click()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-investigation$/)
    cy.title().should('to.match', /Update a CSIP investigation - DPS/)
    cy.findAllByRole('button', { name: /[\s\S]*record decision[\s\S]*/i }).should('not.exist')
    cy.findByRole('heading', { name: /Update CSIP investigation for Testname User/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i }).should('be.visible')
  }

  const checkChangeLinks = () => {
    cy.findByRole('link', { name: /add information on the staff involved in the investigation/i }).should('be.visible')
    cy.findByRole('link', { name: /add information on the evidence secured/i }).should('be.visible')
    cy.findByRole('link', { name: /add information on why the behaviour occurred/i }).should('be.visible')
    cy.findByRole('link', { name: /add information about the prisoner’s usual behaviour presentation/i }).should(
      'be.visible',
    )
    cy.findByRole('link', { name: /add information about the prisoner’s triggers/i }).should('be.visible')
    cy.findByRole('link', { name: /add information about the prisoner’s protective factors/i }).should('be.visible')
  }
})
