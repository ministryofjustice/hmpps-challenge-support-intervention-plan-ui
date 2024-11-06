import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('test /csip-records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubIntervieweeRoles')
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
  })

  it('should render a post-decision, pre-plan csip record', () => {
    cy.task('stubCsipRecordSuccessPlanPending')

    navigateToTestPage()

    cy.url().should('to.match', /\/csip-records\/02e5854f-f7b1-4c56-bec8-69e390eb8550\/investigation$/)
    cy.findAllByRole('button', { name: /develop initial plan/i }).should('be.visible')
    checkInvestigationDetailsExist()

    checkDecision()
    checkTabsAndReferral()

    cy.findAllByRole('button', { name: /develop initial plan/i })
      .first()
      .click()
    checkAxeAccessibility()
    cy.url().should('include', 'develop-an-initial-plan')
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550`)
    checkAxeAccessibility()
  }

  const checkReviews = () => {
    cy.findByRole('link', { name: /reviews/i }).click()
    cy.findByRole('heading', { name: /reviews/i }).should('be.visible')
    cy.findByRole('heading', { name: 'Review 1:' })
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
      })
    cy.findByRole('heading', { name: 'Review 2:' })
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
      })
  }

  const checkPlanDetailsExist = () => {
    cy.findByText('some person').should('be.visible')
    cy.findByText('plan reason').should('be.visible')
    cy.findByText('25 May 2024').should('be.visible')
    cy.get('.govuk-summary-card').should('have.length', 3)
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.findByRole('heading', { name: 'first need' }).should('be.visible')
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
        cy.findByRole('heading', { name: 'second need' }).should('be.visible')
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
        cy.findByRole('heading', { name: 'closed need' }).should('be.visible')
        cy.findByText('Closed').should('be.visible')
        cy.findByText('Not provided').should('be.visible')
        cy.findByText('we need to do things').should('be.visible')
        cy.findByText('joe bloggs').should('be.visible')
        cy.findByText('1 April 2024').should('be.visible')
        cy.findByText('2 June 2024').should('be.visible')
      })
  }

  const checkInvestigationDetailsExist = () => {
    cy.findByRole('heading', { name: /investigation$/i }).should('be.visible')
    cy.findByText('staff stafferson').should('be.visible')
    cy.findByText('SomeVidence').should('be.visible')
    cy.findByText('bananas').should('be.visible')
    cy.findByText('a great person').should('be.visible')
    cy.findByText('spiders').should('be.visible')
    cy.findByText('SomeFactors').should('be.visible')

    cy.findByRole('heading', { name: /interviews/i }).should('be.visible')
    cy.findByRole('heading', { name: /Interview with Some Person/ }).should('be.visible')
    cy.findByText('Some Person').should('be.visible')
    cy.findByText('25 December 2024').should('be.visible')
    cy.findByText('Role2').should('be.visible')
    cy.findByText('some text').should('be.visible')
  }

  const checkTabsForPlan = () => {
    cy.findByRole('link', { name: /^investigation/i }).should('be.visible')
    cy.findByRole('link', { name: /^reviews/i }).should('be.visible')
    cy.findByRole('link', { name: /^referral/i }).should('be.visible')
    cy.findByRole('link', { name: /^plan/i, current: 'page' }).should('be.visible')
  }

  const checkTabsAndReferral = () => {
    cy.findByRole('link', { name: /^investigation/i }).should('be.visible')
    cy.findByRole('link', { name: /^investigation/i, current: 'page' }).should('be.visible')

    cy.findByRole('link', { name: /referral/i })
      .should('be.visible')
      .click()
    checkAxeAccessibility()
    cy.findByRole('link', { name: /referral/i, current: 'page' }).should('be.visible')
  }

  const checkDecision = () => {
    cy.findByRole('heading', { name: /investigation decision/i }).should('be.visible')
    cy.findByText('dec-conc').should('be.visible')
    cy.findByText('Another option').should('be.visible')
    cy.findByText('prison officer').should('be.visible')
    cy.findByText('some person longer').should('be.visible')
    cy.findByText('1 August 2024').should('be.visible')
    cy.findByText(/stuff up[\s\S]*and there[\s\S]*whilst also being down here/i).should('be.visible')
    cy.findByText(/some action[\s\S]*with another one[\s\S]*a final action/i).should('be.visible')
  }

  const checkContributoryFactors = () => {
    cy.findByRole('heading', { name: /contributory factors/i }).should('be.visible')
    cy.get('.govuk-summary-card').should('have.length', 3)
    cy.get('.govuk-summary-card').findAllByText('Text').should('have.length', 2)
    cy.get('.govuk-summary-card').findAllByText('Contributory factor').should('have.length', 1)
    cy.get('.govuk-summary-card').findAllByText('Not provided').should('have.length', 1)
    cy.get('.govuk-summary-card').findAllByText('Comment').should('have.length', 1)
  }
})
