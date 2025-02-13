import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'
import { generateSaveTimestamp } from '../../../../utils/appendFieldUtils'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'

context('test /update-referral/reasons', () => {
  const uuid = uuidV4()
  const title = /Add information to the reasons given for the behaviour/i
  const errorMsg = /Enter an update to the reasons given for the behaviour/i
  const dividerText = generateSaveTimestamp('John Smith')
  const totalUsedChars = dividerText.length + 158 // 158 = already existing reason text

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

  it('test reasons, including all edge cases, proactive', () => {
    navigateToTestPage()
    cy.title().should('equal', `Add information to the reasons given for the behaviour - Update a CSIP referral - DPS`)
    checkValuesPersist()
    checkValidation()
    proceedToNextPage()
  })

  it('test reasons, should show chars left immediately', () => {
    navigateToTestPage()
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          knownReasons: 'a'.repeat(3001),
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
    cy.findByRole('link', { name: /Add information to the reasons given for the behaviour/i }).click()
    cy.url().should('to.match', /\/update-referral\/reasons#knownReasons$/)
    checkAxeAccessibility()
  }

  const checkValuesPersist = () => {
    cy.findByRole('textbox').should('have.value', '')
    cy.findByText(/<script>alert\('xss'\);<\/script>/).should('be.visible')
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
      `reasons must be ${Number(4000 - totalUsedChars).toLocaleString()} characters or less`,
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
