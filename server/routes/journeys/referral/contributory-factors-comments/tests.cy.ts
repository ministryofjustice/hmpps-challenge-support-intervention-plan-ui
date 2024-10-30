import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /referral/contributory-factor-comment', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/contributory-factors-comments`

  const getAddComment = () => cy.findByRole('link', { name: 'Add comment on Factor1 factor' })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubContribFactors')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')
  })

  it('should try out all cases', () => {
    cy.signIn()
    cy.visit(START_URL, { failOnStatusCode: false })

    injectJourneyDataAndReload(uuid, {
      referral: {
        contributoryFactors: [{ factorType: { code: `A<>"'&`, description: 'Factor1' } }],
      },
    })

    cy.visit(PAGE_URL)

    checkAxeAccessibility()
    validatePageContents()

    getAddComment().click()
    cy.url().should('to.match', /\/a%3C%3E%22'&-comment$/)
    cy.go('back')
    getContinueButton().click()
    cy.url().should('to.match', /\/safer-custody$/)
  })

  const validatePageContents = () => {
    cy.title().should('equal', 'Add comments about the contributory factors - Make a CSIP referral - DPS')
    cy.findByText('Add comments about the contributory factors (optional)').should('be.visible')

    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /contributory-factors$/)
  }
})
