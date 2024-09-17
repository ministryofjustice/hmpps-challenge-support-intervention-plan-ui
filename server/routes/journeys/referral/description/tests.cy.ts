import { v4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

const proactiveTitle = /Describe the behaviour and the concerns relating to the behaviour/i
const reactiveTitle = /Describe the incident and the concerns relating to the incident/i

const proactiveErrorMsg = /enter a description of the behaviour and concerns/i
const reactiveErrorMsg = /enter a description of the incident and concerns/i

context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
  })

  it('test description, including all edge cases, reactive', () => {
    const uuid = v4()

    setupDataSignInAndGo(false, uuid)
    checkValidation(false)
    checkValuesPersist(false)
    checkDetailsSummary(false)
  })

  it('test description, including all edge cases, proactive', () => {
    const uuid = v4()

    setupDataSignInAndGo(true, uuid)
    checkValidation(true)
    checkValuesPersist(true)
    checkDetailsSummary(true)
  })

  const checkDetailsSummary = (proactive: boolean) => {
    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    cy.findByText(proactive ? /a summary of the concerns/i : /a summary of the incident/i).should('be.visible')
  }

  const checkValuesPersist = (proactive: boolean) => {
    cy.findByRole('button', { name: /continue/i }).click()
    cy.url().should('include', 'reasons')
    cy.go('back')
    cy.findByRole('textbox', { name: proactive ? proactiveTitle : reactiveTitle }).should(
      'have.value',
      'a'.repeat(4000),
    )
  }

  const checkValidation = (proactive: boolean) => {
    cy.findByRole('heading', { name: proactive ? proactiveTitle : reactiveTitle }).should('be.visible')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p')
      .contains(proactive ? proactiveErrorMsg : reactiveErrorMsg)
      .should('be.visible')
    cy.findByRole('link', { name: proactive ? proactiveErrorMsg : reactiveErrorMsg })
      .should('be.visible')
      .click()
    cy.findByRole('textbox', { name: proactive ? proactiveTitle : reactiveTitle }).should('be.focused')

    cy.findByRole('textbox').type('a'.repeat(4001), {
      delay: 0,
      force: true,
    })
    cy.findByRole('button', { name: /continue/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', { name: /description must be 3,943 characters or less/i }).should('be.visible')
    cy.contains(/description must be 3,943 characters or less/i).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: proactive ? proactiveTitle : reactiveTitle })
      .clear()
      .type('a'.repeat(3000), {
        delay: 0,
        force: true,
      })
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
    cy.findByRole('textbox', { name: proactive ? proactiveTitle : reactiveTitle }).type('a')
    cy.contains(/you have 999 characters remaining/i).should('be.visible')
    cy.findByRole('textbox', { name: proactive ? proactiveTitle : reactiveTitle }).type('a'.repeat(999), {
      delay: 0,
      force: true,
    })
    cy.contains(/you have 0 characters remaining/i).should('be.visible')
  }

  const setupDataSignInAndGo = (proactive: boolean, uuid: string) => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      referral: {
        isProactiveReferral: proactive,
      },
    })
    cy.visit(`${uuid}/referral/description`)
  }
})
