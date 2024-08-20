import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /referral/confirmation', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
  })

  it('should display page correctly', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()
  })

  const validatePageContents = () => {
    cy.findByRole('link', { name: /^CSIPs/i })
      .should('have.attr', 'href')
      .and('match', /\//)

    cy.findByText('CSIP referral complete').should('be.visible')

    cy.findByText('What happens next').should('be.visible')
    cy.findByText('We’ve sent the referral to the Safer Custody team.').should('be.visible')
    cy.findByText('They may contact you:').should('be.visible')
    cy.findByText('if they need more information to make a decision on next steps').should('be.visible')
    cy.findByText('to provide guidance on actions if the referral does not procede to an investigation or plan').should(
      'be.visible',
    )
  }
})
