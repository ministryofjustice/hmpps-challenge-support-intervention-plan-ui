import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { generateSaveTimestamp } from '../../../../utils/appendFieldUtils'

context('test /update-referral/proactive-or-reactive', () => {
  const uuid = uuidV4()
  const title = /Describe the behaviour and the concerns relating to the behaviour/i
  const errorMsg = /enter a description of the behaviour and concerns/i
  const dividerText = generateSaveTimestamp('John Smith')
  const totalUsedChars = dividerText.length + 170 // 170 = already existing description text

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubCsipRecordPatchSuccess')
    cy.task('stubCsipRecordGetSuccess')
  })

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: /Confirm and save/i }).click()
    cy.url().should('to.match', /csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550/)
    cy.findByText('You’ve updated the behaviour description.').should('be.visible')
  }

  it('test description, including all edge cases, proactive', () => {
    navigateToTestPage()
    cy.url().should('to.match', /\/update-referral\/description#descriptionOfConcern$/)
    checkAxeAccessibility()
    checkValuesPersist()
    checkValidation()
    checkDetailsSummary()
    proceedToNextPage()
  })

  it('test description, should show chars left immediately', () => {
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          descriptionOfConcern: 'a'.repeat(3001),
        },
      },
    })
    cy.contains(new RegExp(`you have ${4000 - 3001 - dividerText.length} characters remaining`, 'i')).should(
      'be.visible',
    )
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start`, {
      failOnStatusCode: false,
    })
    cy.findByRole('link', { name: /change the description of the behaviour and concerns/i }).click()
  }

  const checkDetailsSummary = () => {
    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    cy.findByText(/a summary of the concerns/i).should('be.visible')
  }

  const checkValuesPersist = () => {
    cy.findByRole('textbox').should('have.value', '')
    cy.findByText(/<script>alert\('concerns'\);<\/script>/).should('be.visible')
  }

  const checkValidation = () => {
    cy.findByRole('heading', { name: title }).should('be.visible')
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p').contains(errorMsg).should('be.visible')
    cy.findByRole('link', { name: errorMsg }).should('be.visible').click()
    cy.findByRole('textbox', { name: title }).should('be.focused')
    cy.reload()
    cy.findByRole('textbox').type('   ')
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.get('p').contains(errorMsg).should('be.visible')

    cy.findByRole('textbox')
      .clear()
      .type('a'.repeat(4001 - totalUsedChars), {
        delay: 0,
        force: true,
      })
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)

    const errorRegexp = new RegExp(
      `description must be ${Number(4000 - totalUsedChars).toLocaleString()} characters or less`,
      'i',
    )
    cy.findByRole('link', { name: errorRegexp }).should('be.visible')
    cy.contains(errorRegexp).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: title })
      .clear()
      .type(
        'a'.repeat(2999 - totalUsedChars), // prefix and timestamp lengths
        {
          delay: 0,
          force: true,
        },
      )
    cy.contains(/you have [0-9]{0,1},?[0-9]{1,3} characters remaining/i).should('not.be.visible')
    cy.findByRole('textbox', { name: title }).type('a')
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
  }
})
