import { v4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

const uuid = v4()

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('test description, including all edge cases', () => {
    setupDataSignInAndGo(false)

    checkValidation()

    checkValuesPersist()
  })

  const checkValuesPersist = () => {
    cy.findByRole('button', { name: /continue/i }).click()
    cy.url().should('include', 'reasons')
    cy.go('back')
    cy.findByRole('textbox', { name: /describe the incident and concerns/i }).should('have.value', 'a'.repeat(4000))
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: /describe the incident and concerns/i }).should('be.visible')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p')
      .contains(/enter a description of the incident and concerns/i)
      .should('be.visible')
    cy.findByRole('link', { name: /enter a description of the incident and concerns/i })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: /describe the incident and concerns/i }).should('be.focused')

    cy.findByRole('textbox').type('a'.repeat(4001), {
      delay: 0,
      force: true,
    })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /description must be 4,000 characters or less/i }).should('be.visible')
    cy.contains(/description must be 4,000 characters or less/i).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: /describe the incident and concerns/i })
      .clear()
      .type('a'.repeat(3000), {
        delay: 0,
        force: true,
      })
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
    cy.findByRole('textbox', { name: /describe the incident and concerns/i }).type('a')
    cy.contains(/you have 999 characters remaining/i).should('be.visible')
    cy.findByRole('textbox', { name: /describe the incident and concerns/i }).type('a'.repeat(999), {
      delay: 0,
      force: true,
    })
    cy.contains(/you have 0 characters remaining/i).should('be.visible')
  }

  const setupDataSignInAndGo = (proactive: boolean) => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      referral: {
        isProactiveReferral: proactive,
      },
    })
    cy.visit(`${uuid}/referral/description`)
  }
})
