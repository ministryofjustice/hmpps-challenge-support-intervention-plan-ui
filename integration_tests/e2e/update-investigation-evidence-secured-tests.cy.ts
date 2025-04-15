import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'
import { generateSaveTimestamp } from '../../server/utils/appendFieldUtils'

context('test /update-investigation/evidence-secured', () => {
  const uuid = uuidV4()

  const title = { name: 'Add information on the evidence secured' }

  const ERRORS = {
    EMPTY: { name: /Enter an update on the evidence secured/i },
    MAX: { name: /Update to the evidence secured must be [0-9,]+ characters or less/i },
  }

  const SUCCESS_MESSAGE = 'You’ve updated the investigation information.'

  const getInputTextbox = () => cy.findByRole('textbox', title)
  const getContinueButton = () => cy.findByRole('button', { name: /Confirm and save/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessAwaitingDecision')
  })

  it('should try out all cases', () => {
    cy.task('stubPatchInvestigationSuccess')
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /evidence-secured$/)
    cy.title().should('equal', 'Add information on the evidence secured - Update a CSIP investigation - DPS')

    validatePageContents()
    validateErrorMessage()
    proceedToNextScreen()
  })

  it('should show chars left immediately when existing text is over 3000 chars', () => {
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          investigation: {
            evidenceSecured: 'a'.repeat(3000),
          },
        },
      },
    })
    cy.contains(`You have ${1000 - generateSaveTimestamp('John Smith').length} characters remaining`).should(
      'be.visible',
    )
    cy.get('.govuk-inset-text').should('be.visible')
  })

  it('should not show inset text when text is initially blank', () => {
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          investigation: {
            evidenceSecured: '',
          },
        },
      },
    })
    cy.get('.govuk-inset-text').should('not.exist')
  })

  it('should handle API errors', () => {
    cy.task('stubPatchInvestigationFail')
    navigateToTestPage()

    getInputTextbox().clear().type('some text')
    getContinueButton().click()

    cy.url().should('to.match', /evidence-secured$/)
    cy.findByText('Simulated Error for E2E testing').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-investigation/start`, {
      failOnStatusCode: false,
    })
    cy.url().should('to.match', /update-investigation$/)
    cy.visit(`${uuid}/update-investigation/evidence-secured`)
  }

  const validatePageContents = () => {
    cy.findByRole('heading', title).should('be.visible')
    cy.findByText('SomeVidence').should('be.visible')
    getContinueButton().should('be.visible')
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /update-investigation$/)
    cy.findByRole('link', { name: /Cancel/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
  }

  const validateErrorMessage = () => {
    getInputTextbox().clear()
    getContinueButton().click()
    cy.findByRole('link', ERRORS.EMPTY).should('be.visible').click()
    getInputTextbox().should('be.focused')

    getInputTextbox().type('a'.repeat(4001), {
      delay: 0,
    })
    getContinueButton().click()
    cy.findByRole('link', ERRORS.MAX).should('be.visible').click()
    cy.findAllByText(/You have [0-9,]+ characters too many/)
      .filter(':visible')
      .should('have.length.of.at.least', 1)
    getInputTextbox().should('be.focused')

    getInputTextbox().clear().type('  ')
    getContinueButton().click()
    cy.findByRole('link', ERRORS.EMPTY).should('be.visible').click()
    getInputTextbox().should('be.focused')
  }

  const proceedToNextScreen = () => {
    getInputTextbox().clear().type("<script>alert('xss');</script>")
    getContinueButton().click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText(SUCCESS_MESSAGE).should('be.visible')
  }
})
