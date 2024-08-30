import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/check-answers', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubPostPlan')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    validatePageContents()

    validateChangeLinks()

    continueToConfirmation()
  })

  it('should not allow continuing if all needs are deleted', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/check-answers$/)

    cy.findByRole('link', { name: /add, change or delete identified needs/i })
      .should('be.visible')
      .click()

    cy.findByRole('link', { name: /delete the identified need a need goes here/i })
      .should('be.visible')
      .click()

    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/identified-needs$/)

    cy.findByRole('link', { name: /delete the identified need another need goes here/i })
      .should('be.visible')
      .click()

    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/identified-needs$/)

    cy.findByRole('button', { name: /Continue/i }).should('not.exist')
  })

  const validateChangeLinks = () => {
    cy.findByRole('link', { name: /change the case manager/i }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/#caseManager/i)
    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('textbox', { name: /name of case manager/i })
      .clear()
      .type('staff casemanagerson')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Case Manager').next().should('include.text', 'staff casemanagerson')

    cy.findByRole('link', { name: /change the reason for the plan/i }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/#reasonForPlan/i)
    cy.findByRole('textbox', { name: /what’s the main reason why Testname User needs a plan\?/i })
      .clear()
      .type('differentreason')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Reason for the plan').next().should('include.text', 'differentreason')

    cy.findByRole('link', { name: /change the next review date/i }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/next-review-date#firstCaseReviewDate/i)
    const today = new Date()
    cy.findByRole('textbox', { name: /When will you next review the plan with Testname User\?/i })
      .clear()
      .type(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`)
    cy.findByRole('button', { name: /continue/i }).click()
    cy.contains('dt', 'Next review date')
      .next()
      .should('include.text', today.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
  }

  const validatePageContents = () => {
    cy.url().should('to.match', /\/check-answers$/)
    cy.findByRole('heading', { name: /Check your answers before opening a CSIP for Testname User/ }).should(
      'be.visible',
    )

    cy.contains('dt', 'Case Manager').next().should('include.text', 'manager foobar')
    cy.findByRole('link', { name: /change the case manager/i }).should('be.visible')
    cy.contains('dt', 'Reason for the plan').next().should('include.text', 'plan reason')
    cy.findByRole('link', { name: /change the reason for the plan/i }).should('be.visible')
    cy.contains('dt', 'Next review date').next().should('include.text', '25 August 2024')
    cy.findByRole('link', { name: /change the next review date/i }).should('be.visible')

    cy.findByRole('heading', { name: /identified needs/i }).should('be.visible')
    cy.findByRole('link', { name: /add, change or delete identified needs/i }).should('be.visible')

    cy.findByRole('heading', { name: /a need goes here/i }).should('be.visible')
    cy.contains('dt', 'Identified need summary').next().should('include.text', 'a need goes here')
    cy.contains('dt', 'Planned intervention').next().should('include.text', 'some intervention')
    cy.contains('dt', 'Person responsible').next().should('include.text', 'test stafferson')
    cy.contains('dt', 'Target date').next().should('include.text', '20 August 2024')
    cy.contains('dt', 'Actions and progress').next().should('include.text', 'progression goes here')

    cy.findAllByText('Actions and progress').last().next().should('include.text', 'Not provided')
    cy.get('.govuk-summary-card')
      .first()
      .should('include.text', 'a need goes here')
      .next()
      .should('include.text', 'another need goes here')
  }

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`)
    cy.visit(`${uuid}/develop-an-initial-plan/check-answers`)

    injectJourneyDataAndReload(uuid, {
      prisoner: {
        firstName: 'TestName',
        lastName: 'User',
        cellLocation: '',
        prisonerNumber: 'A1111AA',
        prisonId: '',
      },
      plan: {
        identifiedNeeds: [
          {
            closedDate: '2024-08-21',
            createdDate: '2024-08-21',
            identifiedNeed: 'another need goes here',
            intervention: 'other intervention',
            progression: null,
            responsiblePerson: 'staff testerson',
            targetDate: '2024-08-21',
          },
          {
            closedDate: '2024-08-20',
            createdDate: '2024-08-20',
            identifiedNeed: 'a need goes here',
            intervention: 'some intervention',
            progression: 'progression goes here',
            responsiblePerson: 'test stafferson',
            targetDate: '2024-08-20',
          },
        ],
        caseManager: 'manager foobar',
        firstCaseReviewDate: '2024-08-25',
        isCaseManager: false,
        isComplete: true,
        reasonForPlan: 'plan reason',
      },
    })
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and open CSIP/i }).click()
    cy.url().should('to.match', /\/confirmation(#[A-z]+)?$/)
  }
})
