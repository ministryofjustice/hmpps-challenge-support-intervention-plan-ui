import { v4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'
import { components } from '../../../@types/csip'

context('test /update-decision', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubDecisionOutcomeType')
  })

  it('should redirect to home page when journey has expired or is not found', () => {
    cy.signIn()
    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`, { failOnStatusCode: false })

    cy.visit(`12e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/additional-information`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/$/)
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`, { failOnStatusCode: false })

    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('should render the update decision screen', () => {
    cy.task('stubCsipRecordSuccessPlanPending')
    navigateToTestPage()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-decision$/)
    checkAxeAccessibility()
    validatePageContents()
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)
  })

  describe('Should disallow editing of fields nearing 4000 characters', () => {
    const limitReachedText = `This field has reached its character limit. You cannot add anymore characters.`
    const addInformationFields: Array<[keyof components['schemas']['DecisionAndActions'], string]> = [
      ['conclusion', 'Reason for decision'],
      ['nextSteps', 'Comments on next steps'],
      ['actionOther', 'Additional information'],
    ]

    addInformationFields.forEach(([field, heading]) => {
      it(`should disallow editing of ${heading} when nearing 4000 characters`, () => {
        cy.task('stubCsipRecordSuccessPlanPending')
        const uuid = v4()

        cy.signIn()
        cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-decision/start`)

        injectJourneyDataAndReload(uuid, {
          csipRecord: {
            referral: {
              decisionAndActions: {
                [field]: '<a href="https://www.google.com">injecting</a>'.padEnd(3980, 'a'),
              },
            },
          },
        })
        cy.findAllByRole('link', { name: /add information/i }).should('have.length', 2)
        cy.findByText(heading).next().next().should('contain.text', limitReachedText)
      })
    })
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)

    cy.findAllByRole('link', { name: /update decision/i })
      .should('be.visible')
      .first()
      .click()
  }

  const validatePageContents = () => {
    cy.title().should('to.match', /Update a CSIP investigation decision - DPS/)
    cy.findByRole('heading', { name: /Update CSIP investigation decision for Tes'name User/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByRole('link', { name: /add information to the description of the reasons for the decision/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/conclusion#conclusion$/)
    cy.findByRole('link', { name: /add information to the comments on next steps/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/next-steps#nextSteps$/)
    cy.findByRole('link', { name: /add information to the additional information relating to the decision/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/additional-information#actionOther$/)
  }
})
