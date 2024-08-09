import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /record-investigation/interviews-summary', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should try out all cases', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/interviews-summary$/)
    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByText(/No interview details recorded./).should('be.visible')

    proceedToAddInterview('Add interview')
    cy.go('back')

    assertPageWithSubmittedInterview()
    assertInterviewCommentFallbackDisplay()

    cy.findByText(/No interview details recorded./).should('not.exist')

    proceedToAddInterview('Add another interview')
    cy.go('back')

    continueToTaskList()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /\/record-investigation$/)
    cy.findByRole('link', { name: /Interview details/i }).click()
  }

  const proceedToAddInterview = (buttonName: string) => {
    cy.findByRole('button', { name: buttonName }).click()
    cy.url().should('to.match', /\/interview-details$/)
  }

  const assertPageWithSubmittedInterview = () => {
    injectJourneyDataAndReload(uuid, {
      investigation: {
        interviews: [
          {
            interviewee: 'Some Person',
            interviewDate: '2024-12-25',
            intervieweeRole: { code: 'CODE', description: 'Witness' },
            interviewText: 'some text',
          },
        ],
      },
    })

    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByRole('heading', { name: /Interview with Some Person/ }).should('be.visible')
    cy.findByRole('link', { name: /delete interview with some person/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /delete-interview\/1$/)
    cy.go('back')

    cy.contains('dt', 'Interviewee').next().should('include.text', 'Some Person')
    cy.findByRole('link', { name: /change the interviewee's name for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewee$/)
    cy.go('back')

    cy.contains('dt', 'Interview date').next().should('include.text', '25 December 2024')
    cy.findByRole('link', { name: /change the interview date for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewDate$/)
    cy.go('back')

    cy.contains('dt', 'Role').next().should('include.text', 'Witness')
    cy.findByRole('link', { name: /change the interviewee's role for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#intervieweeRole$/)
    cy.go('back')

    cy.contains('dt', 'Comments').next().should('include.text', 'some text')
    cy.findByRole('link', { name: /change the comments for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewText$/)
    cy.go('back')
  }

  const assertInterviewCommentFallbackDisplay = () => {
    injectJourneyDataAndReload(uuid, {
      investigation: {
        interviews: [
          {
            interviewee: 'Some Person',
            interviewDate: '2024-12-25',
            intervieweeRole: { code: 'CODE', description: 'Witness' },
            interviewText: undefined,
          },
        ],
      },
    })

    cy.contains('dt', 'Comments').next().should('include.text', 'Not provided')
  }

  const continueToTaskList = () => {
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.url().should('to.match', /\/record-investigation$/)
  }
})
