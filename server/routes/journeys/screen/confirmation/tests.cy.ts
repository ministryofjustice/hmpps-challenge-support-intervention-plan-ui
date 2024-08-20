import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /screen/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/screen/start`
  const PAGE_URL = `${uuid}/screen/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should display page correctly when outcome type is "No further action"', () => {
    cy.signIn()
    setupData('No further action')

    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
  })

  it('should display page correctly when outcome type is "Progress to investigation"', () => {
    cy.signIn()
    setupData('Progress to investigation')

    cy.visit(START_URL, { failOnStatusCode: false })
    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
    cy.findByText('What needs to happen next').should('be.visible')
    cy.findByText(
      'An investigation must now be carried out. This should include interviewing John Smith about the behaviour that led to the referral',
    ).should('be.visible')
  })

  const setupData = (outcome: string) => {
    injectJourneyDataAndReload(uuid, {
      saferCustodyScreening: {
        outcomeType: { code: 'NFA', description: outcome },
      },
      csipRecord: {
        status: 'PLAN_PENDING',
      },
      prisoner: {
        firstName: 'John',
        lastName: 'Smith',
      },
    })
  }

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^CSIPs/i })
      .should('have.attr', 'href')
      .and('match', /\//)

    cy.findByText('CSIP referral screening outcome recorded').should('be.visible')

    cy.findByText('We’ve updated the status of the referral to “plan pending”.').should('be.visible')
  }
})
