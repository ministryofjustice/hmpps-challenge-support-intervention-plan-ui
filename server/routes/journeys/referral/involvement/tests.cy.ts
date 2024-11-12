import { v4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

const uuid = v4()
context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordPostSuccess')
  })

  it('test involvement, including all edge cases', () => {
    setupDataSignInAndGo()

    checkProactiveReactiveContent()

    checkValidationMessagesDisappearProperly()

    checkValuesPersisted()

    goBackCheckValuesSaved()

    checkEmptyInputNotOverriddenByJourneyData()
  })

  const goBackCheckValuesSaved = () => {
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('staff stafferson', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.url().should('include', 'description')

    cy.findByRole('link', { name: /^back/i }).click()

    cy.findByRole('textbox', { name: /names of staff assaulted/i }).should('have.value', 'staff stafferson')
    cy.findByRole('radio', { name: /factor1/i }).should('be.checked')
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
  }

  const checkEmptyInputNotOverriddenByJourneyData = () => {
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).should('have.value', '')
  }

  const checkValuesPersisted = () => {
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).should('have.value', 'staff stafferson')

    cy.findByRole('radio', { name: /factor1/i }).click()
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).clear()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('radio', { name: /factor1/i }).should('be.checked')
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p')
      .contains(/Enter the names of staff assaulted/i)
      .should('be.visible')
    cy.findByRole('link', { name: /Enter the names of staff assaulted/i }).should('be.visible')
  }

  const checkValidationMessagesDisappearProperly = () => {
    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByText('Names of staff assaulted').should('be.visible')

    cy.get('.govuk-error-summary a').should('have.length', 2)

    // Check they're in the right order
    cy.get('.govuk-error-summary li:nth-of-type(1) a')
      .contains(/select how the prisoner was involved in the incident/i)
      .should('be.visible')
    cy.get('.govuk-error-summary li:nth-of-type(2) a')
      .contains(/select if any staff were assaulted during the incident or not/i)
      .should('be.visible')

    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /select if any staff were assaulted during the incident or not/i }).should(
      'not.exist',
    )
    cy.get('p')
      .contains(/select if any staff were assaulted during the incident or not/i)
      .should('not.exist')
    cy.get('.govuk-error-summary a').should('have.length', 2)

    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('p')
      .contains(/Enter the names of staff assaulted/i)
      .should('not.exist')
    cy.findByRole('link', { name: /Enter the names of staff assaulted/i }).should('not.exist')
    cy.get('.govuk-error-summary a').should('have.length', 1)

    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('textbox', { name: /names of staff assaulted/i }).type('staff stafferson', { delay: 0 })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('p')
      .contains(/Enter the names of staff assaulted/i)
      .should('not.exist')
    cy.findByRole('link', { name: /Enter the names of staff assaulted/i }).should('not.exist')
    cy.get('.govuk-error-summary a').should('have.length', 1)
  }

  const checkProactiveReactiveContent = () => {
    // We're starting with it being proactive, so test the content and validation messages, then switch to reactive so we can test those as well
    cy.title().should('equal', 'Behaviour involvement - Make a CSIP referral - DPS')
    cy.findByRole('heading', { name: /behaviour involvement/i }).should('be.visible')
    cy.findByText(/How was Tes'name User involved in the behaviour\?/).should('be.visible')
    cy.findByText(/have any staff been assaulted as a result of this behaviour\?/i).should('be.visible')

    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /select how the prisoner has been involved in the behaviour/i }).should('be.visible')
    cy.findByRole('link', { name: /select if any staff were assaulted as a result of the behaviour or not/i }).should(
      'be.visible',
    )
    cy.get('p')
      .contains(/select how the prisoner has been involved in the behaviour/i)
      .should('be.visible')
    cy.get('p')
      .contains(/select if any staff were assaulted as a result of the behaviour or not/i)
      .should('be.visible')

    cy.findByRole('link', { name: /^back/i }).click()
    cy.findByRole('link', { name: /^back/i }).click()

    cy.findByRole('radio', { name: /reactive/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.title().should('equal', 'Incident involvement - Make a CSIP referral - DPS')

    cy.findByRole('heading', { name: /incident involvement/i }).should('be.visible')
    cy.findByText(/How was Tes'name User involved in the incident\?/).should('be.visible')
    cy.findByText(/were any staff assaulted during the incident\?/i).should('be.visible')

    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /select how the prisoner was involved in the incident/i }).should('be.visible')
    cy.findByRole('link', { name: /select if any staff were assaulted during the incident or not/i }).should(
      'be.visible',
    )
    cy.get('p')
      .contains(/select how the prisoner was involved in the incident/i)
      .should('be.visible')
    cy.get('p')
      .contains(/select if any staff were assaulted during the incident or not/i)
      .should('be.visible')
    checkAxeAccessibility()
  }

  const setupDataSignInAndGo = () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')
    injectJourneyDataAndReload(uuid, {
      prisoner: {
        firstName: "Tes'name",
        lastName: 'User',
        cellLocation: '',
        prisonerNumber: 'A1111AA',
        prisonId: '',
      },
      referral: {
        contributoryFactors: [],
        isSaferCustodyTeamInformed: 'DO_NOT_KNOW',
        referredBy: '',
        refererArea: {
          code: 'A',
          listSequence: 0,
          description: 'AreaA',
        },

        isProactiveReferral: true,
        incidentDate: '2024-08-01',
        incidentTime: '23:23:00',
        incidentLocation: {
          code: 'A',
          listSequence: 0,
          description: 'LocationA',
        },
        incidentType: {
          code: 'A',
          listSequence: 0,
          description: 'TypeA',
        },
      },
    })
    cy.visit(`${uuid}/referral/involvement`)
  }
})
