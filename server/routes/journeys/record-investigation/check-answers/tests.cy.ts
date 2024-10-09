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
    cy.task('stubIntervieweeRoles')
    cy.task('stubPostInvestigation')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    navigateToTestPage()

    checkAxeAccessibility()

    cy.url().should('to.match', /\/check-answers$/)
    cy.findByRole('heading', { name: /Check your answers before recording the investigation/ }).should('be.visible')

    cy.findByRole('heading', { name: /Interview with Some Person/ }).should('be.visible')
    cy.contains('dt', 'Interviewee').next().should('include.text', 'Some Person')
    cy.contains('dt', 'Interview date').next().should('include.text', '25 December 2020')
    cy.contains('dt', 'Role').next().should('include.text', 'Role1')
    cy.contains('dt', 'Comments').next().should('include.text', 'Not provided')

    cy.findByRole('link', { name: /Add, change or delete investigation interviews/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interviews-summary$/)
    cy.findByRole('link', { name: /change the comments for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewText$/)
    cy.findByRole('textbox', { name: /Comments \(optional\)/ })
      .clear()
      .type('new comments', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.url().should('to.match', /interviews-summary(#[A-z]+)?$/)
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Comments').next().should('include.text', 'new comments')

    cy.contains('dt', 'Staff involved in the investigation')
      .next()
      .should('include.text', `<script>alert('xss-staffInvolved');</script>`)
    cy.findByRole('link', { name: /change the staff involved in the investigation/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /staff-involved(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Staff involved in the investigation').next().should('include.text', 'new text')

    cy.contains('dt', 'Why the behaviour occurred')
      .next()
      .should('include.text', `<script>alert('xss-occurrenceReason');</script>`)
    cy.findByRole('link', { name: /change the description of why the behaviour occurred/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /why-behaviour-occurred(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Why the behaviour occurred').next().should('include.text', 'new text')

    cy.contains('dt', 'Evidence secured')
      .next()
      .should('include.text', `<script>alert('xss-evidenceSecured');</script>`)
    cy.findByRole('link', { name: /change the description of the evidence secured/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /evidence-secured(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Evidence secured').next().should('include.text', 'new text')

    cy.contains('dt', 'Usual behaviour presentation')
      .next()
      .should('include.text', `<script>alert('xss-personsUsualBehaviour');</script>`)
    cy.findByRole('link', { name: /change the description of the prisoner’s usual behaviour presentation/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /usual-behaviour-presentation(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Usual behaviour presentation').next().should('include.text', 'new text')

    cy.contains('dt', 'Triggers').next().should('include.text', `<script>alert('xss-personsTrigger');</script>`)
    cy.findByRole('link', { name: /change the description of the prisoner’s triggers/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /triggers(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Triggers').next().should('include.text', 'new text')

    cy.contains('dt', 'Protective factors')
      .next()
      .should('include.text', `<script>alert('xss-protectiveFactors');</script>`)
    cy.findByRole('link', { name: /change the description of the prisoner’s protective factors/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /protective-factors(#[A-z]+)?$/)
    cy.findByRole('textbox').clear().type('new text', { delay: 0 })
    cy.findByRole('button', { name: /Continue/i }).click()
    cy.contains('dt', 'Protective factors').next().should('include.text', 'new text')

    continueToConfirmation()
  })

  it('should redirect to /record-investigation if all interviews are deleted', () => {
    navigateToTestPage()

    cy.url().should('to.match', /\/check-answers$/)

    cy.findByRole('link', { name: /Add, change or delete investigation interviews/i })
      .should('be.visible')
      .click()

    cy.findByRole('link', { name: /delete interview with some person/i })
      .should('be.visible')
      .click()

    cy.findByRole('button', { name: /Yes, delete it/ }).click()
    cy.url().should('to.match', /\/interviews-summary$/)
    cy.findByText(/No interview details recorded./).should('be.visible')
    cy.findByRole('button', { name: /Continue/i }).click()

    cy.url().should('to.match', /\/record-investigation$/)
  })

  const navigateToTestPage = () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)
    cy.url().should('to.match', /\/record-investigation$/)

    injectJourneyDataAndReload(uuid, {
      investigation: {
        interviews: [
          {
            interviewee: 'Some Person',
            interviewDate: '2020-12-25',
            intervieweeRole: { code: 'A', description: 'Role1' },
          },
        ],
        staffInvolved: `<script>alert('xss-staffInvolved');</script>`,
        evidenceSecured: `<script>alert('xss-evidenceSecured');</script>`,
        occurrenceReason: `<script>alert('xss-occurrenceReason');</script>`,
        personsUsualBehaviour: `<script>alert('xss-personsUsualBehaviour');</script>`,
        personsTrigger: `<script>alert('xss-personsTrigger');</script>`,
        protectiveFactors: `<script>alert('xss-protectiveFactors');</script>`,
      },
    })

    cy.findByRole('link', { name: /Check and save report/i }).click()
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and save report/i }).click()
    cy.url().should('to.match', /\/confirmation(#[A-z]+)?$/)
  }
})
