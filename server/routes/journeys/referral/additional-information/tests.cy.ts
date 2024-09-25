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

    checkValidation()

    checkAxeAccessibility()

    checkValuesPersist()
  })

  const checkValuesPersist = () => {
    cy.findByRole('textbox').clear()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.url().should('include', 'check-answers')

    cy.go('back')
    cy.findByRole('textbox').type('aaa')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.go('back')
    cy.findByRole('textbox').should('have.value', 'aaa')
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: /add additional information \(optional\)/i }).should('be.visible')
    cy.findByRole('textbox').type('a'.repeat(4001), {
      delay: 0,
      force: true,
    })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /additional information must be 4,000 characters or less/i }).should('be.visible')
    cy.contains(/additional information must be 4,000 characters or less/i).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox').clear().type('a'.repeat(3000), {
      delay: 0,
      force: true,
    })
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
    cy.findByRole('textbox').type('a')
    cy.contains(/you have 999 characters remaining/i).should('be.visible')
    cy.findByRole('textbox').type('a'.repeat(999), {
      delay: 0,
      force: true,
    })
    cy.contains(/you have 0 characters remaining/i).should('be.visible')
  }

  const setupDataSignInAndGo = () => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      referral: {},
    })
    cy.visit(`${uuid}/referral/additional-information`)
  }
})
