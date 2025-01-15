import { v4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'
import { components } from '../../../@types/csip'

context('test /update-investigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
  })

  it('should redirect to home page when journey has expired or is not found', () => {
    cy.signIn()

    injectJourneyDataAndReload('12e5854f-f7b1-4c56-bec8-69e390eb8550', { stateGuard: true })
    cy.visit(`12e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/evidence-secured`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/$/)
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised$/)
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

  describe('Should disallow editing of fields nearing 4000 characters', () => {
    const limitReachedText = `This field has reached its character limit. You cannot add anymore characters.`
    const addInformationFields: Array<[keyof components['schemas']['Investigation'], string]> = [
      ['staffInvolved', 'Staff involved'],
      ['evidenceSecured', 'Evidence secured'],
      ['occurrenceReason', 'Why this occurred'],
      ['personsUsualBehaviour', 'Usual behaviour presentation'],
      ['personsTrigger', 'Triggers'],
      ['protectiveFactors', 'Protective factors'],
    ]

    addInformationFields.forEach(([field, heading]) => {
      it(`should disallow editing of ${heading} when nearing 4000 characters`, () => {
        cy.task('stubCsipRecordSuccessAwaitingDecision')
        const uuid = v4()

        cy.signIn()
        cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`)

        injectJourneyDataAndReload(uuid, {
          csipRecord: {
            referral: {
              investigation: {
                [field]: '<a href="https://www.google.com">injecting</a>'.padEnd(3980, 'a'),
              },
            },
          },
        })
        cy.findAllByRole('link', { name: /add information/i }).should('have.length', 5)
        cy.findByText(heading).next().next().should('contain.text', limitReachedText)
      })
    })
  })

  const checkInterviews = () => {
    cy.get('.govuk-summary-card').should('have.length', 2)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: /interview with some person/i }).should('be.visible')
        cy.get('dd').contains('Some Person').should('be.visible')
        cy.findByRole('link', { name: /change the interviewee’s name \(interview with some person\)/i }).should(
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
    cy.findByRole('heading', { name: /Update CSIP investigation for Tes'name User/ }).should('be.visible')
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
