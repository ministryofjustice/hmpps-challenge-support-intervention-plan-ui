import { v4 as uuidV4, validate } from 'uuid'

context('test /record-investigation/interviews-summary', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubIntervieweeRoles')
  })

  it('should try out all cases', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/interviews-summary$/)
    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByText(/No interview details recorded./).should('be.visible')

    proceedToAddInterview('Add interview')

    validatePageContents()
    validateEmptyValidationErrors()
  })

  const validatePageContents = () => {
    cy.findByRole('heading', { name: /Interview details/ }).should('be.visible')

    cy.findByRole('heading', { name: /Interviewee name/ }).should('be.visible')
    cy.findByRole('textbox', { name: /Interviewee name/ }).should('be.visible')
    cy.findByRole('heading', { name: /Interview date/ }).should('be.visible')
    cy.findByRole('textbox', { name: /Interview date/ }).should('be.visible')
    cy.findByRole('heading', { name: /Comments \(optional\)/ }).should('be.visible')
    cy.findByRole('textbox', { name: /Comments \(optional\)/ }).should('be.visible')
    cy.findByRole('group', { name: /How was the interviewee involved\?/ }).should('be.visible')
    
    cy.findByRole('radio', { name: /Role1/ }).should('exist')
    cy.findByRole('radio', { name: /Role2/ }).should('exist')

    cy.findByRole('button', { name: /Continue/ }).should('be.visible')
  }

  const validateEmptyValidationErrors = () => {
    cy.findByRole('button', { name: /Continue/ }).click()

    cy.findByRole('link', { name: /Enter the interviewee’s name/i }).should('be.visible').click()
    cy.findByRole('textbox', { name: /Interviewee name/i }).should('be.focused')
    cy.findByRole('link', { name: /Enter the date of the interview/i }).should('be.visible').click()
    cy.findByRole('textbox', { name: /Interview date/ }).should('be.focused')
    cy.findByRole('link', { name: /Select how the interviewee was involved/i }).should('be.visible').click()
    cy.findByRole('radio', { name: /Role1/ }).should('be.focused')


    cy.get('.govuk-error-summary a').should('have.length', 3)
    cy.findAllByText('Enter the interviewee’s name').should('have.length', 2)
    cy.findAllByText('Enter the date of the interview').should('have.length', 2)
    cy.findAllByText('Select how the interviewee was involved').should('have.length', 2)
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /\/record-investigation$/)
    cy.findByRole('link', { name: /Interview details/i }).click()
  }

  const proceedToAddInterview = (buttonName: string) => {
    cy.findByRole('button', { name: buttonName }).click()
    cy.url().should('to.match', /\/interview-details\/1$/)
  }
})
