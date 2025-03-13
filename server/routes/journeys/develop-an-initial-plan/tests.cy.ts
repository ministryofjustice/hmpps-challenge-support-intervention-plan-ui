import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('test /develop-an-initial-plan', () => {
  const uuid = uuidV4()

  const getIsCaseManagerRadio = () => cy.findByRole('radio', { name: /Yes/ })
  const getIsNotCaseManagerRadio = () => cy.findByRole('radio', { name: /No/ })
  const getCaseManagerTextField = () => cy.findByRole('textbox', { name: /Name of Case Manager/ })
  const getReasonsTextField = () =>
    cy.findByRole('textbox', { name: /What’s the main reason why Tes'name User needs a plan\?/ })
  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

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

    cy.url().should('to.match', /\/develop-an-initial-plan$/)

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
    verifySubmittedValueIsPersisted()

    validateOptionalInput()
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`)
  }

  const validatePageContents = () => {
    cy.findByRole('group', { name: /Are you the Case Manager for Tes'name User’s plan\?/ }).should('be.visible')
    getIsCaseManagerRadio().should('exist')
    getIsNotCaseManagerRadio().should('exist')
    getCaseManagerTextField().should('not.exist')
    getReasonsTextField().should('be.visible')
    getContinueButton().should('be.visible')
  }

  const validateErrorMessage = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select if you’re the Case Manager for this plan or not/i })
      .should('be.visible')
      .click()
    getIsCaseManagerRadio().should('be.focused')

    cy.findByRole('link', { name: /Enter the main reason why the prisoner needs a plan/i })
      .should('be.visible')
      .click()
    getReasonsTextField().should('be.focused')

    getIsNotCaseManagerRadio().click()
    getCaseManagerTextField().should('be.visible')
    getContinueButton().click()

    cy.findByRole('link', { name: /Enter the Case Manager’s name/i })
      .should('be.visible')
      .click()

    cy.get('.govuk-form-group > .govuk-label').should('contain.text', 'If not, provide their name')
    getCaseManagerTextField().should('be.focused')

    getCaseManagerTextField().type('a'.repeat(101), { delay: 0 })
    getReasonsTextField().type('a'.repeat(242), { delay: 0 })
    getContinueButton().click()

    cy.findByRole('link', { name: /Case Manager’s name must be 100 characters or less/i })
      .should('be.visible')
      .click()
    getCaseManagerTextField().should('be.focused')
    cy.findAllByText('You have 1 character too many').filter(':visible').should('have.length.of.at.least', 1)

    cy.findByRole('link', { name: /Reason why the prisoner needs a plan must be 240 characters or less/i })
      .should('be.visible')
      .click()
    getReasonsTextField().should('be.focused')
    cy.findAllByText('You have 2 characters too many').filter(':visible').should('have.length.of.at.least', 1)
  }

  const proceedToNextScreen = () => {
    getCaseManagerTextField().clear().type(`<script>alert('xss-getCaseManagerTextfield');</script>`, { delay: 0 })
    getReasonsTextField().clear().type(`<script>alert('xss-getReasonsTextfield');</script>`, { delay: 0 })
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.url().should('to.match', /\/identified-needs$/)
  }

  const verifySubmittedValueIsPersisted = () => {
    cy.go('back')
    cy.reload()
    getIsNotCaseManagerRadio().should('be.checked')
    getCaseManagerTextField().should('have.value', `<script>alert('xss-getCaseManagerTextfield');</script>`)
    getReasonsTextField().should('have.value', `<script>alert('xss-getReasonsTextfield');</script>`)
  }

  const validateOptionalInput = () => {
    getIsCaseManagerRadio().click()
    getCaseManagerTextField().should('not.exist')
    getContinueButton().click()
    cy.url().should('to.match', /\/identified-needs$/)
  }
})
