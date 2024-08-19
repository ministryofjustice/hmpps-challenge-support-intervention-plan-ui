import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /record-investigation', () => {
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
    checkAxeAccessibility()

    cy.url().should('to.match', /\/record-investigation$/)

    validatePageContents()

    validatePageContentsWithInjectedJourneyData()

    proceedToNextScreen()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', { name: 'Record a CSIP investigation' }).should('be.visible')
    cy.findByText(/LEI123/).should('be.visible')

    cy.findByRole('link', { name: 'Interview details' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/interviews-summary/)

    cy.findByRole('link', { name: 'Staff involved in the investigation' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/staff-involved$/)

    cy.findByRole('link', { name: 'Why the behaviour occurred' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/why-behaviour-occurred$/)

    cy.findByRole('link', { name: 'Evidence secured' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/evidence-secured$/)

    cy.findByRole('link', { name: 'Usual behaviour presentation' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/usual-behaviour-presentation$/)

    cy.findByRole('link', { name: 'Testname User’s triggers' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/triggers$/)

    cy.findByRole('link', { name: 'Protective factors' })
      .should('have.attr', 'href')
      .and('match', /record-investigation\/protective-factors$/)

    cy.findByRole('link', { name: 'Check and submit report' }).should('not.exist')
    cy.findAllByText('Incomplete').should('have.length', 7)
    cy.findByText('Cannot start yet').should('be.visible')
  }

  const validatePageContentsWithInjectedJourneyData = () => {
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
        staffInvolved: `<script>alert('xss-staffInvolved');</script>`,
        occurrenceReason: `<script>alert('xss-occurrenceReason');</script>`,
        evidenceSecured: `<script>alert('xss-evidenceSecured');</script>`,
        personsUsualBehaviour: `<script>alert('xss-personsUsualBehaviour');</script>`,
        personsTrigger: `<script>alert('xss-personsTrigger');</script>`,
        protectiveFactors: `<script>alert('xss-protectiveFactors');</script>`,
      },
    })

    cy.findAllByText('Completed').should('have.length', 7)
    cy.findByText('Incomplete').should('be.visible')
  }

  const proceedToNextScreen = () => {
    cy.findByRole('link', { name: 'Check and submit report' }).click()
    cy.url().should('to.match', /\/check-answers$/)
  }
})
