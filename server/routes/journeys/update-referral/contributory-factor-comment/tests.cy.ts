import { v4 as uuidV4 } from 'uuid'

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
    cy.task('stubCsipRecordGetSuccessLongCFComment')
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
    cy.contains('You have 942 characters remaining').should('be.visible')
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
  }

  const checkValidation = () => {
    const limit = 3933
    const used = 67
    cy.findByRole('textbox')
      .clear()
      .type('a'.repeat(limit + 1), {
        delay: 0,
        force: true,
      })
    cy.findByRole('button', { name: /confirm and save/i }).click()
    cy.get('.govuk-error-summary a').should('have.length', 1)

    cy.findByRole('link', { name: 'Comment must be 3,933 characters or less' }).should('be.visible')
    cy.contains(/you have 1 character too many/i).should('be.visible')

    cy.findByRole('textbox', { name: title })
      .clear()
      .type(
        'a'.repeat(3000 - used - 1), // prefix and timestamp lengths
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
    cy.findByRole('heading', { name: title }).should('be.visible')
    cy.findByText('Update a CSIP referral').should('be.visible')
  }
})