import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { generateSaveTimestamp } from '../../../../utils/appendFieldUtils'

context('test /update-referral/contributory-factor-comment', () => {
  const uuid = uuidV4()
  const title = 'Add information to the comment on text factors (optional)'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubCsipRecordGetSuccess')
    cy.signIn()
  })

  it('should render the update referral screen with more contrib factors available', () => {
    cy.task('stubPatchContributoryFactorSuccess')

    navigateToTestPage()

    goToChangingCFCommentPage(0)
    checkValidation()
  })

  it('should not show inset text when there is no comment', () => {
    navigateToTestPage()

    goToChangingCFCommentPage(2)

    cy.get('.govuk-inset-text').should('not.exist')
  })

  it('test comment, should show chars left immediately', () => {
    navigateToTestPage()
    goToChangingCFCommentPage(1)
    cy.contains(`You have ${1000 - generateSaveTimestamp('John Smith').length} characters remaining`).should(
      'be.visible',
    )
    cy.get('.govuk-inset-text').should('be.visible')
  })

  it('should show not found page when a contributory factor does not exist', () => {
    navigateToTestPage()

    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/not-a-uuid-comment#comment`, {
      failOnStatusCode: false,
    })
    cy.findByRole('heading', { name: /Page not found/i }).should('be.visible')

    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/${uuid}-comment#comment`, {
      failOnStatusCode: false,
    })
    cy.findByRole('heading', { name: /Page not found/i }).should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start`)
    injectJourneyDataAndReload(uuid, {
      csipRecord: {
        referral: {
          contributoryFactors: [
            {
              factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f1',
              factorType: { code: 'CODE3', description: 'Text' },
              comment: 'a'.repeat(3000),
            },
            {
              factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f2',
              factorType: { code: 'CODE2', description: 'Text' },
            },
            {
              factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f3',
              factorType: { code: 'CODE3', description: 'Text' },
              comment: 'a'.repeat(10),
            },
          ],
        },
      },
    })
  }

  const checkValidation = () => {
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)
    cy.findByRole('link', {
      name: /Enter an update to the comment on .+ factors/i,
    }).should('be.visible')

    const timestampLength = generateSaveTimestamp('John Smith').length
    cy.findByRole('textbox')
      .clear()
      .type('a'.repeat(4000 - 10 - timestampLength + 1), {
        delay: 0,
        force: true,
      })
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)

    cy.findByRole('link', {
      name: `Update to the comment must be ${(4000 - 10 - timestampLength).toLocaleString()} characters or less`,
    }).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: title })
      .clear()
      .type(
        'a'.repeat(3000 - timestampLength - 10 - 1), // prefix and timestamp lengths
        {
          delay: 0,
          force: true,
        },
      )
    cy.contains(/you have [0-9]{0,1},?[0-9]{1,3} characters remaining/i).should('not.be.visible')
    cy.findByRole('textbox', { name: title }).type('2')
    cy.contains(/you have 1,000 characters remaining/i).should('be.visible')
  }

  const goToChangingCFCommentPage = (index: number = 0) => {
    cy.get('.govuk-summary-card')
      .eq(index)
      .within(() => {
        cy.findByRole('link', { name: /Add information/i }).click()
      })

    cy.url().should(
      'to.match',
      /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+-comment#comment$/,
    )
    cy.title().should('equal', 'Add information to the comment on text factors - Update a CSIP referral - DPS')
    cy.findByRole('heading', { name: title }).should('be.visible')
    cy.findByText('Update a CSIP referral').should('be.visible')
  }
})
