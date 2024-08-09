import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /record-investigation/delete-interview', () => {
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
    navigateToTestPage({
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
    cy.url().should('to.match', /\/delete-interview\/1$/)
    cy.findByRole('heading', { name: /Are you sure you want to delete this interview\?/ }).should('be.visible')

    cy.contains('dt', 'Interviewee').next().should('include.text', 'Some Person')
    cy.contains('dt', 'Interview date').next().should('include.text', '25 December 2024')
    cy.contains('dt', 'Role').next().should('include.text', 'Witness')
    cy.contains('dt', 'Comments').next().should('include.text', 'some text')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('to.match', /\/interviews-summary$/)
    cy.findByRole('button', { name: /^No, do not delete it/i })
      .should('have.attr', 'href')
      .and('to.match', /\/interviews-summary$/)

    proceedToDelete()
  })

  const navigateToTestPage = (journeyData: object) => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /\/record-investigation$/)
    cy.findByRole('link', { name: /Interview details/i }).click()
    cy.url().should('to.match', /\/interviews-summary$/)

    injectJourneyDataAndReload(uuid, journeyData)

    cy.findByRole('link', { name: /delete interview with some person/i }).click()
  }

  const proceedToDelete = () => {
    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/interviews-summary$/)
    cy.findByText(/No interview details recorded./).should('be.visible')
  }
})
