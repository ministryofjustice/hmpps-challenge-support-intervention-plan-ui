import Page from '../pages/page'
import OnBehalfOfPage from '../pages/referral/on-behalf-of'

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
  })

  it('happy path', () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')
    const onBehalfOfPage = Page.verifyOnPage(OnBehalfOfPage)
    onBehalfOfPage.miniProfileDob().should('contain.text', '02/02/1932')
  })
})
