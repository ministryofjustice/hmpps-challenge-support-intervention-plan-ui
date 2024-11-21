import { addDays, formatDate } from 'date-fns'
import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/record-investigation/start', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessCsipOpen')
    cy.task('stubIntervieweeRoles')
    cy.task('stubPostReview')
  })

  it('happy path', () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-review/start`)

    cy.url().should('to.match', /\/record-review$/)

    cy.findByRole('link', { name: 'Check and save report' }).should('not.exist')
    cy.findAllByText('Incomplete').should('have.length', 3)
    cy.findByText('Cannot save yet').should('be.visible')

    cy.findByRole('link', { name: /Details of the review/ }).click()
    cy.findByRole('textbox', { name: 'Enter details of the review' }).clear().type('review details', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /record-review$/)

    cy.findByRole('link', { name: /Participants and contributions/ }).click()
    cy.findByRole('button', { name: 'Add participant' }).click()
    cy.url().should('to.match', /\/participant-contribution-details\/1$/)
    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('textbox', { name: /What’s the participant’s name\?/ })
      .clear()
      .type('John Smith', { delay: 0 })
    cy.findByRole('textbox', { name: /What’s their role\?/ })
      .clear()
      .type('a role', { delay: 0 })
    cy.findByRole('textbox', { name: /What did they contribute to the review\? \(optional\)/ })
      .clear()
      .type('a contrib', { delay: 0 })
    getContinueButton().click()
    getContinueButton().click()
    cy.url().should('to.match', /record-review$/)

    cy.findByRole('link', { name: /Outcome/ }).click()
    cy.findByRole('radio', { name: 'What’s the outcome of this review? Keep the prisoner on the plan' }).click()
    getContinueButton().click()
    cy.url().should('to.match', /\/next-review-date$/)
    cy.findByRole('textbox', { name: "When will you next review the plan with Tes'name User?" }).type(
      formatDate(new Date(), 'dd/MM/yyyy'),
      {
        delay: 0,
      },
    )
    getContinueButton().click()
    cy.url().should('to.match', /\/record-review$/)

    cy.findByRole('link', { name: /Check and save report/ }).click()
    cy.url().should('to.match', /\/check-answers$/)

    verifyCya()
  })

  const verifyCya = () => {
    cy.contains('dt', 'Review details').next().should('include.text', 'review details')
    cy.contains('dt', 'Review outcome').next().should('include.text', 'Keep the prisoner on the plan')
    cy.contains('dt', 'Next review date').next().should('include.text', formatDate(new Date(), 'd MMMM yyyy'))
    cy.contains('dt', 'Name').next().should('include.text', 'John Smith')
    cy.contains('dt', 'Role').next().should('include.text', 'a role')
    cy.contains('dt', 'Attended in person').next().should('include.text', 'Yes')
    cy.contains('dt', 'Contribution').next().should('include.text', 'a contrib')

    verifyCyaChangeLinks()
  }

  const verifyCyaChangeLinks = () => {
    cy.findByRole('link', { name: /Change the details of the review/ }).click()
    cy.url().should('to.match', /details#summary$/)
    cy.get('textarea').clear().type('changed summary', { delay: 0 })
    getContinueButton().click()
    cy.contains('dt', 'Review details').next().should('include.text', 'changed summary')

    cy.findByRole('link', { name: /Change the next review date/ }).click()
    cy.url().should('to.match', /next-review-date#nextReviewDate$/)
    cy.findByRole('textbox')
      .clear()
      .type(formatDate(addDays(new Date(), 1), 'dd/MM/yyyy'), { delay: 0 })
    getContinueButton().click()
    cy.contains('dt', 'Next review date')
      .next()
      .should('include.text', formatDate(addDays(new Date(), 1), 'd MMMM yyyy'))

    cy.findByText(/Add, change or delete/).click()
    cy.url().should('to.match', /participants-summary$/)

    cy.findByRole('link', { name: /Change the participant’s name/ }).click()
    cy.url().should('to.match', /participant-contribution-details\/1#name$/)
    cy.findByRole('textbox', { name: /What’s the participant’s name?/ })
      .clear()
      .type('a new name', { delay: 0 })
    cy.findByRole('textbox', { name: /What’s their role?/ })
      .clear()
      .type('a new role', { delay: 0 })
    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('textbox', { name: /What did they contribute to the review\? \(optional\)/ })
      .clear()
      .type('new contributions', { delay: 0 })
    getContinueButton().click()
    getContinueButton().click()
    cy.contains('dt', 'Name').next().should('include.text', 'a new name')
    cy.contains('dt', 'Role').next().should('include.text', 'a new role')
    cy.contains('dt', 'Attended in person').next().should('include.text', 'No')
    cy.contains('dt', 'Contribution').next().should('include.text', 'new contributions')

    cy.findByRole('link', { name: /Change the review outcome/ }).click()
    cy.url().should('to.match', /outcome#outcome$/)
    cy.findByRole('radio', { name: /Close the CSIP/ }).click()
    getContinueButton().click()
    cy.findByRole('button', { name: /Yes, close CSIP/ }).click()
    cy.contains('dt', 'Review outcome').next().should('include.text', 'Close the CSIP')
    cy.findByRole('button', { name: /Record review and close CSIP/ }).click()

    cy.findByText(/CSIP review recorded for Tes'name User/)
  }
})