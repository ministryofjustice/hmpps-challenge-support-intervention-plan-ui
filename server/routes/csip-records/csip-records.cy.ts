import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('test /csip-records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubIntervieweeRoles')
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

    cy.contains('dt', 'Screening date').next().should('include.text', `01 August 2024`)
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

    cy.contains('dt', 'Screening date').next().should('include.text', `01 August 2024`)
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

  const checkInvestigationDetailsExist = () => {
    cy.findByRole('heading', { name: /investigation$/i }).should('be.visible')
    cy.findByText('22 July 2024').should('be.visible')
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
    cy.findByText('Witness').should('be.visible')
    cy.findByText('some text').should('be.visible')
  }

  const checkTabsAndReferral = () => {
    cy.findByRole('link', { name: /investigation/i }).should('be.visible')
    cy.findByRole('link', { name: /investigation/i, current: 'page' }).should('be.visible')

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
    cy.findByText('01 August 2024').should('be.visible')
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
