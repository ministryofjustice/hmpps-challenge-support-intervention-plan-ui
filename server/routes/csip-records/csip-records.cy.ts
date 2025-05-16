import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'
import { components } from '../../@types/csip'

context('test /csip-records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubIntervieweeRoles')
  })

  describe('CSRF redirects to sign-out when tampered with', () => {
    it('Top button', () => {
      cy.task('stubCsipRecordGetSuccessAfterScreeningWithoutReason')

      navigateToTestPage()

      cy.findAllByRole('button', { name: /record investigation/i })
        .last()
        .click()

      cy.url().should('to.match', /record-investigation/)

      cy.go('back')

      cy.get('input[name="_csrf"]').first().invoke('val', 'changed value')

      cy.findAllByRole('button', { name: /record investigation/i })
        .first()
        .click()

      cy.url().should('to.match', /\/sign-out/)
    })

    it('Bottom button', () => {
      cy.task('stubCsipRecordGetSuccessAfterScreeningWithoutReason')

      navigateToTestPage()

      cy.findAllByRole('button', { name: /record investigation/i })
        .last()
        .click()

      cy.url().should('to.match', /record-investigation/)

      cy.go('back')

      cy.get('input[name="_csrf"]').last().invoke('val', 'changed value')

      cy.findAllByRole('button', { name: /record investigation/i })
        .last()
        .click()

      cy.url().should('to.match', /\/sign-out/)
    })
  })

  it('should render the print button', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)
    cy.findByRole('button', { name: /print options/i }).should('be.visible')
  })

  it('should render a post-decision, pre review csip record (read only role)', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordSuccessCsipOpenWith', {
      plan: { nextCaseReviewDate: '', identifiedNeeds: [{ identifiedNeed: 'longunbrokentext'.repeat(100) }] },
    } as Partial<components['schemas']['CsipRecord']>)

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)

    cy.findAllByRole('button', { name: /[\s\S]*record csip review[\s\S]*/i }).should('not.exist')
    cy.findAllByRole('link', { name: /update plan/i }).should('have.length', 0)
    cy.findByRole('link', { name: /add, change, close or reopen/i }).should('not.exist')

    checkAxeAccessibility()

    cy.get('[id$=csip-plan]').within(() => {
      // Next review date
      cy.get('.govuk-summary-list__value').eq(2).should('contain.text', '-')

      // Ensure identified need text is wrapped and doesn't break page boundaries (750px in cypress tests)
      cy.get('.govuk-summary-card__title')
        .should('include.text', 'longunbrokentext')
        .invoke('width')
        .should('be.lte', 750)
      // Ensure tag doesn't get stretched with long identified need text
      cy.get('.govuk-tag').invoke('height').should('be.lte', 40)
    })

    checkTabsForPlan()

    checkReviews()
    checkChangeScreenLink(false)
  })

  it('should render a post-decision, pre review csip record', () => {
    cy.task('stubCsipRecordSuccessCsipOpen')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/plan$/)
    cy.findAllByRole('button', { name: /[\s\S]*record csip review[\s\S]*/i }).should('be.visible')
    cy.findAllByRole('link', { name: /update plan/i }).should('have.length', 2)
    cy.findAllByRole('link', { name: /update plan/i }).should(
      'have.attr',
      'href',
      '/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-plan/start',
    )
    cy.findByRole('link', { name: /add, change, close or reopen/i }).should('be.visible')
    checkAxeAccessibility()
    checkPlanDetailsExist()

    checkTabsForPlan()

    checkReviews()
    checkChangeScreenLink(false)
  })

  it('should render a post-investigation, pre decision csip record (read only)', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordSuccessAwaitingDecision')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /[\s\S]*record decision[\s\S]*/i }).should('not.exist')
    cy.findByRole('heading', { name: /decision/i }).should('not.exist')
    cy.findAllByRole('link', { name: /update referral/i }).should('have.length', 0)
    cy.findAllByRole('link', { name: /update investigation/i }).should('have.length', 0)
    checkInvestigationDetailsExist()

    checkTabsAndReferral()
    checkChangeScreenLink(false)
  })

  it('should render a post-investigation, pre decision csip record', () => {
    cy.task('stubCsipRecordSuccessAwaitingDecision')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /[\s\S]*record decision[\s\S]*/i }).should('be.visible')
    cy.findByRole('heading', { name: /decision/i }).should('not.exist')
    cy.findAllByRole('link', { name: /update referral/i }).should('have.length', 0)
    checkInvestigationDetailsExist()

    checkTabsAndReferral()
    checkChangeScreenLink(false)
  })

  it('should render pre-investigation csip record (read only)', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findAllByRole('button', { name: /screen referral/i }).should('not.exist')
    cy.findAllByRole('link', { name: /update referral/i }).should('have.length', 2)
    cy.findAllByRole('link', { name: /update referral/i }).should(
      'have.attr',
      'href',
      '/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start',
    )

    checkContributoryFactors()
  })

  it('should render pre-investigation csip record', () => {
    cy.task('stubCsipRecordGetSuccess')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findAllByRole('button', { name: /screen referral/i }).should('be.visible')
    cy.findAllByRole('link', { name: /update referral/i }).should('have.length', 2)
    cy.findAllByRole('link', { name: /update referral/i }).should(
      'have.attr',
      'href',
      '/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/update-referral/start',
    )

    checkContributoryFactors()
  })

  it('should render a post-screen csip record (read only)', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithoutReason')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findByRole('heading', { name: /referral screening/i }).should('be.visible')
    cy.findAllByRole('button', { name: /record investigation/i }).should('not.exist')

    cy.get('.govuk-details__summary-text').should('have.length', 0)
    checkChangeScreenLink(false, false)
  })

  it('should render a post-screen csip record (no screening reason)', () => {
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithoutReason')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findByRole('heading', { name: /referral screening/i }).should('be.visible')
    cy.findAllByRole('button', { name: /record investigation/i }).should('be.visible')

    cy.contains('dt', 'Screening date').next().should('include.text', `1 August 2024`)
    cy.contains('dt', 'Screening outcome').next().should('include.text', `Progress to investigation`)
    cy.contains('dt', 'Reasons for decision').next().should('include.text', `Not provided`)
    cy.contains('dt', 'Recorded by').next().should('include.text', `Test User`)

    checkChangeScreenLink(true, false)
  })

  it('should render a post-screen csip record (with screening reason)', () => {
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithReason')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findByRole('heading', { name: /referral screening/i }).should('be.visible')
    cy.findAllByRole('button', { name: /record investigation/i }).should('be.visible')

    cy.contains('dt', 'Screening date').next().should('include.text', `1 August 2024`)
    cy.contains('dt', 'Screening outcome').next().should('include.text', `Progress to investigation`)
    cy.contains('dt', 'Reasons for decision').next().should('include.text', `a very well thought out reason`)
    cy.contains('dt', 'Recorded by').next().should('include.text', `Test User`)
    cy.findAllByText(/Recorded by/).should('have.length', 1) // Only screening recorded by should show as we set referralCompletedByDisplayName to undefined
    checkChangeScreenLink(true, false)
  })

  it('should render a post-decision, pre-plan csip record (read only)', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordSuccessPlanPending')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /develop initial plan/i }).should('not.exist')
    cy.findAllByRole('link', { name: /update decision/i }).should('not.exist')
    checkInvestigationDetailsExist()

    checkDecision()
    checkTabsAndReferral()
    checkChangeScreenLink(false)
  })

  it('should render a post-decision, pre-plan csip record', () => {
    cy.task('stubCsipRecordSuccessPlanPending')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /develop initial plan/i }).should('be.visible')
    checkInvestigationDetailsExist()

    checkDecision()
    checkTabsAndReferral()

    checkChangeScreenLink(false)

    cy.get('.govuk-details__summary-text').should('have.length', 0)

    cy.findAllByRole('button', { name: /develop initial plan/i })
      .first()
      .click()
    checkAxeAccessibility()
    cy.url().should('include', 'develop-an-initial-plan')
  })

  it('should show referral screening history', () => {
    cy.task('stubSignIn', { roles: [] })
    cy.task('stubCsipRecordGetSuccessAfterScreeningWithHistory')

    navigateToTestPage()

    cy.findByRole('link', { name: /investigation/i }).should('not.exist')
    cy.findByRole('link', { name: /referral/i }).should('not.exist')
    cy.findByRole('heading', { name: /referral details/i }).should('be.visible')
    cy.findByRole('heading', { name: /referral screening/i }).should('be.visible')
    cy.findAllByRole('button', { name: /record investigation/i }).should('not.exist')

    cy.get('.govuk-details__summary-text')
      .should('have.length', 1)
      .should('contain.text', 'Show previous screenings')
      .click()

    cy.findByRole('heading', { name: 'Previous screening 1' })
    cy.contains('details > div > dl > div > dt', 'Screening date').next().should('include.text', `1 August 2024`)
    cy.contains('details > div > dl > div > dt', 'Screening outcome').next().should('include.text', `No further action`)
    cy.contains('details > div > dl > div > dt', 'Reasons for decision')
      .next()
      .should('include.text', `a very well thought out reason`)
    cy.contains('details > div > dl > div > dt', 'Recorded by').next().should('include.text', `Test User`)

    cy.findByRole('heading', { name: 'Previous screening 2' })
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Screening date')
      .next()
      .should('include.text', `2 August 2024`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Screening outcome')
      .next()
      .should('include.text', `Progress to CSIP`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Reasons for decision')
      .next()
      .should('include.text', `a very well thought out reason`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Recorded by')
      .next()
      .should('include.text', `Test User`)
  })

  it('should show investigation decision history', () => {
    cy.task('stubCsipRecordSuccessPlanPendingWithDecisionHistory')

    navigateToTestPage()

    cy.get('.govuk-details__summary-text')
      .should('have.length', 1)
      .should('contain.text', 'Show previous decisions')
      .click()

    cy.findByRole('heading', { name: 'Previous decision 1' })

    cy.contains('details > div > dl > div > dt', 'Decision date').next().should('include.text', `1 August 2024`)
    cy.contains('details > div > dl > div > dt', 'Decision outcome').next().should('include.text', `No further action`)
    cy.contains('details > div > dl > div > dt', 'Signed off by').next().should('include.text', `prison officer`)
    cy.contains('details > div > dl > div > dt', 'Reason for decision')
      .next()
      .should('include.text', `another decision`)
    cy.contains('details > div > dl > div > dt', 'Comments on next steps').next().should('include.text', `nextSteps`)
    cy.contains('details > div > dl > div > dt', 'Additional information').next().should('include.text', `actionsOther`)
    cy.contains('details > div > dl > div > dt', 'Recorded by').next().should('include.text', `same person longer`)

    cy.findByRole('heading', { name: 'Previous decision 2' })

    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Decision date')
      .next()
      .should('include.text', `2 August 2024`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Decision outcome')
      .next()
      .should('include.text', `Progress to CSIP`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Signed off by')
      .next()
      .should('include.text', `Custodial Manager`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Reason for decision')
      .next()
      .should('include.text', `another historical decision`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Comments on next steps')
      .next()
      .should('include.text', `nextSteps again`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Additional information')
      .next()
      .should('include.text', `actionsOther again`)
    cy.contains('details > div > dl:nth-of-type(2) > div > dt', 'Recorded by')
      .next()
      .should('include.text', `a different person longer`)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    checkAxeAccessibility()
  }

  const checkReviews = () => {
    cy.findByRole('link', { name: /reviews/i }).click()
    cy.findByRole('heading', { name: 'Review 1:' })
      .should('match', 'h2')
      .should('be.visible')
      .parent()
      .parent()
      .next('dl')
      .eq(0)
      .within(() => {
        cy.findByText('Keep the prisoner on the plan').should('be.visible')
        cy.findByText('a summary').should('be.visible')
        cy.findByText('joe bloggs').should('be.visible')
        cy.findByText('5 April 2024').should('be.visible')
        cy.findByText('Not provided').should('be.visible')
      })
    cy.findByRole('heading', { name: 'Review 2:' })
      .should('match', 'h2')
      .should('be.visible')
      .parent()
      .parent()
      .next('dl')
      .eq(0)
      .within(() => {
        cy.findByText('Keep the prisoner on the plan').should('be.visible')
        cy.findByText('even longer').should('be.visible')
        cy.findByText('test testerson').should('be.visible')
        cy.findByText('15 April 2024').should('be.visible')
        cy.findByText('15 April 2025').should('be.visible')
      })
  }

  const checkPlanDetailsExist = () => {
    cy.findByText('some person').should('be.visible')
    cy.findByText('plan reason').should('be.visible')
    cy.findByText('25 May 2024').should('be.visible')

    cy.get('[id$=csip-plan]').within(() => {
      cy.get('.govuk-summary-card').should('have.length', 3)
      cy.get('.govuk-summary-card')
        .eq(0)
        .within(() => {
          cy.findByRole('heading', { name: 'first need' }).should('be.visible').should('match', 'h4')
          cy.findByText('Open').should('be.visible')
          cy.findByText('progression done').should('be.visible')
          cy.findByText('get it sorted').should('be.visible')
          cy.findByText('test testerson').should('be.visible')
          cy.findByText('1 March 2024').should('be.visible')
          cy.findByText('2 April 2024').should('be.visible')
        })
      cy.get('.govuk-summary-card')
        .eq(1)
        .within(() => {
          cy.findByRole('heading', { name: 'second need' }).should('be.visible').should('match', 'h4')
          cy.findByText('Open').should('be.visible')
          cy.findByText('almost there').should('be.visible')
          cy.findByText('int1').should('be.visible')
          cy.findByText('foo barerson').should('be.visible')
          cy.findByText('1 June 2024').should('be.visible')
          cy.findByText('1 April 2024').should('be.visible')
        })
      cy.get('.govuk-summary-card')
        .eq(2)
        .within(() => {
          cy.findByRole('heading', { name: 'closed need' }).should('be.visible').should('match', 'h4')
          cy.findByText('Closed').should('be.visible')
          cy.findByText('Not provided').should('be.visible')
          cy.findByText('we need to do things').should('be.visible')
          cy.findByText('joe bloggs').should('be.visible')
          cy.findByText('1 April 2024').should('be.visible')
          cy.findByText('2 June 2024').should('be.visible')
        })
    })
  }

  const checkInvestigationDetailsExist = () => {
    cy.findByRole('heading', { name: /investigation$/i })
      .should('be.visible')
      .should('match', 'h2')

    cy.get('[id$=csip-investigation]').within(() => {
      cy.findByText('staff stafferson').should('be.visible')
      cy.findByText('SomeVidence').should('be.visible')
      cy.findByText('bananas').should('be.visible')
      cy.findByText('a great person').should('be.visible')
      cy.findByText('spiders').should('be.visible')
      cy.findByText('SomeFactors').should('be.visible')

      cy.findByRole('heading', { name: /interviews/i })
        .should('be.visible')
        .should('match', 'h3')
      cy.findByRole('heading', { name: /Interview with Some Person/ })
        .should('be.visible')
        .should('match', 'h4')
      cy.findByText('Some Person').should('be.visible')
      cy.findByText('25 December 2024').should('be.visible')
      cy.findByText('Role2').should('be.visible')
      cy.findByText('some text').should('be.visible')

      cy.get('dl > div:nth-child(7) > dt').should('contain.text', 'Recorded by')
      cy.get('dl > div:nth-child(7) > dd').should('contain.text', 'Not provided')
    })
  }

  const checkTabsForPlan = () => {
    cy.get('#main-content > div > div > nav > ul > li > a').eq(0).should('have.text', 'Referral')
    cy.get('#main-content > div > div > nav > ul > li > a').eq(1).should('have.text', 'Investigation')
    cy.get('#main-content > div > div > nav > ul > li > a')
      .eq(2)
      .should('have.text', 'Plan')
      .should('have.attr', 'aria-current', 'page')
    cy.get('#main-content > div > div > nav > ul > li > a').eq(3).should('have.text', 'Reviews')
  }

  const checkChangeScreenLink = (visible: boolean, hasTabs: boolean = true) => {
    if (hasTabs) {
      cy.findByRole('link', { name: /referral/i })
        .eq(0)
        .should('be.visible')
        .click()
    }

    if (visible) {
      cy.contains('dt', 'Screening outcome').next().next().should('include.text', `Change outcome`)
    } else {
      cy.contains('dt', 'Screening outcome').parent().children().should('have.length', 2)
    }
  }

  const checkTabsAndReferral = () => {
    cy.get('#main-content > div > div > nav > ul > li > a').eq(0).should('have.text', 'Referral')
    cy.get('#main-content > div > div > nav > ul > li > a')
      .eq(1)
      .should('have.text', 'Investigation')
      .should('have.attr', 'aria-current', 'page')

    cy.findByRole('link', { name: /referral/i })
      .should('be.visible')
      .click()
    checkAxeAccessibility()
    cy.findByRole('link', { name: /referral/i, current: 'page' }).should('be.visible')
    cy.contains('dt', 'Referral date').next().should('include.text', `1 August 2024`)
    cy.contains('dt', 'Referrer name').next().should('include.text', `<script>alert("Test User")</script>`)
    cy.contains('dt', 'Area of work').next().should('include.text', `<script>alert("Area")</script>`)
    cy.contains('dt', 'Proactive or reactive referral').next().should('include.text', `Proactive`)
    cy.contains('dt', 'Recorded by').next().should('include.text', `Test`)
  }

  const checkDecision = () => {
    cy.findByRole('heading', { name: /investigation decision/i })
      .should('be.visible')
      .should('match', 'h2')

    cy.get('[id$=csip-investigation]').within(() => {
      cy.findByText('dec-conc').should('be.visible')
      cy.findByText('Another option').should('be.visible')
      cy.findByText('prison officer').should('be.visible')
      cy.findByText('some person longer').should('be.visible')
      cy.findByText('1 August 2024').should('be.visible')
      cy.findByText(/stuff up[\s\S]*and there[\s\S]*whilst also being down here/i).should('be.visible')
      cy.findByText(/some action[\s\S]*with another one[\s\S]*a final action/i).should('be.visible')
    })
  }

  const checkContributoryFactors = () => {
    cy.findByRole('heading', { name: /contributory factors/i })
      .should('be.visible')
      .should('match', 'h3')
    cy.get('.govuk-summary-card').should('have.length', 3)
    cy.get('.govuk-summary-card').findAllByText('Text').should('have.length', 2).should('match', 'h4')
    cy.get('.govuk-summary-card').findAllByText('Contributory factor').should('have.length', 1)
    cy.get('.govuk-summary-card').findAllByText('Not provided').should('have.length', 1)
    cy.get('.govuk-summary-card').findAllByText('Comment').should('have.length', 1)
  }
})
