import { v4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'
import { components } from '../../../@types/csip'
import { injectJourneyDataAndReload } from '../../../../integration_tests/utils/e2eTestUtils'

context('test /update-referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
  })

  it('should allow access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()
    goToUpdatePage(true)

    cy.url().should('to.match', /\/update-referral/)
  })

  it('should render the update referral screen with more contrib factors available', () => {
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    goToUpdatePage()

    cy.findByRole('button', { name: /add another contributory factor/i }).should('be.visible')

    checkChangeLinks()
    checkCfChangeLinks()
  })

  it('should render the update referral screen with no more contrib factors available', () => {
    cy.task('stubOneContribFactor')
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    goToUpdatePage()

    cy.findByRole('button', { name: /add another contributory factor/i }).should('not.exist')
  })

  it('should render contributory factors properly with duplicates and all edge cases', () => {
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordGetSuccessCFEdgeCases')

    navigateToTestPage()

    goToUpdatePage()

    checkCfs()
  })

  it('should redirect to csip-records screen if CSIP record is invalid for this journey', () => {
    cy.task('stubCsipRecordGetSuccessAfterScreeningNFA')
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)

    cy.visit(`csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start`)
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
  })

  describe('Should disallow editing of fields nearing 4000 characters', () => {
    const limitReachedText = `This field has reached it’s character limit. You cannot add anymore characters.`
    const addInformationFields: Array<[keyof components['schemas']['Referral'], string]> = [
      ['descriptionOfConcern', 'Description of behaviour and concerns'],
      ['knownReasons', 'Reasons given for the behaviour'],
      ['otherInformation', 'Other information relating to this referral'],
    ]

    addInformationFields.forEach(([field, heading]) => {
      it(`should disallow editing of ${heading} when nearing 4000 characters`, () => {
        cy.task('stubContribFactors')
        cy.task('stubCsipRecordGetSuccess')
        const uuid = v4()

        cy.signIn()
        cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start`)

        injectJourneyDataAndReload(uuid, {
          csipRecord: {
            referral: {
              [field]: '<a href="https://www.google.com">injecting</a>'.padEnd(3980, 'a'),
            },
          },
        })
        cy.findAllByRole('link', { name: /add information/i }).should('have.length', 5)
        cy.findByText(heading).next().next().should('contain.text', limitReachedText)
      })
    })

    it('should disallow editing of contributory factor comment when nearing 4000 characters', () => {
      cy.task('stubContribFactors')
      cy.task('stubCsipRecordGetSuccess')
      const uuid = v4()

      cy.signIn()
      cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start`)

      injectJourneyDataAndReload(uuid, {
        csipRecord: {
          referral: {
            contributoryFactors: [
              {
                factorType: { code: 'CODE3', description: 'Text' },
                comment: '<a href="https://www.google.com">injecting</a>'.padEnd(3980, 'a'),
                factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f2',
              },
            ],
          },
        },
      })

      cy.get('.govuk-summary-card')
        .eq(0)
        .within(() => {
          cy.findByText('Comment').next().next().should('contain.text', limitReachedText)
        })
    })
  })

  const checkCfs = () => {
    cy.get('.govuk-summary-card').should('have.length', 5)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: 'TextA' }).should('be.visible')
        cy.findByText('commentA').should('be.visible')
        cy.findByRole('link', { name: /add information to the comment on TextA factor/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the contributory factor/i }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('heading', { name: 'TextB' }).should('be.visible')
        cy.findByText('commentB').should('be.visible')
        cy.findByRole('link', { name: /add information to the comment on TextB factor/i }).should('be.visible')
        cy.findByRole('link', { name: /Change the contributory factor/i }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.findByRole('heading', { name: 'TextC1' }).should('be.visible')
        cy.findByText('AcommentC').should('be.visible')
        cy.findByRole('link', {
          name: /add information to the first comment on TextC1 factor. This contributory factor is listed 2 times in this referral./i,
        }).should('be.visible')
        cy.findByRole('link', { name: /Change the contributory factor/i }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(3)
      .within(() => {
        cy.findByRole('heading', { name: 'TextC1' }).should('be.visible')
        cy.findByText('commentC').should('be.visible')
        cy.findByRole('link', {
          name: /add information to the second comment on TextC1 factor. This contributory factor is listed 2 times in this referral./i,
        }).should('be.visible')
        cy.findByRole('link', { name: /Change the contributory factor/i }).should('be.visible')
      })
    cy.get('.govuk-summary-card')
      .eq(4)
      .within(() => {
        cy.findByRole('heading', { name: 'TextD1' }).should('be.visible')
        cy.findByRole('link', { name: /add information to the comment on TextD1 factor/i }).should('be.visible')
      })
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
  }

  const goToUpdatePage = (readonly = false) => {
    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/referral$/)
    checkAxeAccessibility()
    if (!readonly) {
      cy.findAllByRole('button', { name: /[\s\S]*screen referral[\s\S]*/i }).should('be.visible')
    }

    cy.findAllByRole('link', { name: /update referral/i })
      .should('be.visible')
      .first()
      .click()
    cy.url().should('to.match', /\/([0-9a-zA-Z]+-){4}[0-9a-zA-Z]+\/update-referral$/)
    cy.title().should('to.match', /Update a CSIP referral - DPS/)
    cy.findAllByRole('button', { name: /[\s\S]*screen referral[\s\S]*/i }).should('not.exist')
    cy.findByRole('heading', { name: /Update CSIP referral for Tes'name User/ }).should('be.visible')
    cy.findByRole('link', { name: /cancel/i }).should('be.visible')
  }

  const checkChangeLinks = () => {
    cy.findByRole('link', { name: /Change if the referral is proactive or reactive/i }).should('be.visible')
    cy.findByRole('link', { name: /Change name of referrer/i }).should('be.visible')
    cy.findByRole('link', { name: /Change area of work/i }).should('be.visible')
    cy.findByRole('link', { name: /Change date of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change time of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change location of occurrence/i }).should('be.visible')
    cy.findByRole('link', { name: /Change main concern/i }).should('be.visible')
    cy.findByRole('link', { name: /Change how the prisoner was involved/i }).should('be.visible')
    cy.findByRole('link', { name: /Change if a staff member was assaulted or not/i }).should('be.visible')
    cy.findByRole('link', { name: /Add information to the description of the behaviour and concerns/i }).should(
      'be.visible',
    )
    cy.findByRole('link', { name: /Add information to the reasons given for the behaviour/i }).should('be.visible')
    cy.findByRole('link', { name: /Change if Safer Custody are aware of the referral or not/i }).should('be.visible')
    cy.findByRole('link', { name: /Add information to the additional information relating to the referral/i }).should(
      'be.visible',
    )
  }

  const checkCfChangeLinks = () => {
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i })
          .should('be.visible')
          .should('have.attr', 'href')
          .and('include', 'update-referral/b8dff21f-e96c-4240-aee7-28900dd910f2-type#contributoryFactor')
      })
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i })
          .should('be.visible')
          .should('have.attr', 'href')
          .and('include', 'update-referral/b8dff21f-e96c-4240-aee7-28900dd910f1-type#contributoryFactor-2')
      })
    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.findByRole('link', { name: /Change the contributory factor/i })
          .should('be.visible')
          .should('have.attr', 'href')
          .and('include', 'update-referral/b8dff21f-e96c-4240-aee7-28900dd910f3-type#contributoryFactor-2')
      })
  }
})
