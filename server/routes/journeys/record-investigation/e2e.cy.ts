import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/record-investigation/start', () => {
  const uuid = uuidV4()

  const sections = {
    DETAILS: 'Interview details',
    STAFF: 'Staff involved in the investigation',
    WHY_BEHAVIOUR: 'Why the behaviour occurred',
    EVIDENCE: 'Evidence secured',
    USUAL_BEHAVIOUR: 'Usual behaviour presentation',
    TRIGGERS: 'Testname User’s triggers',
    PROTECTIVE_FACTORS: 'Protective factors',
    CHECK: 'Check and save report',
  }

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

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

  it('happy path', () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/record-investigation/start`)

    cy.url().should('to.match', /\/record-investigation$/)

    allSectionsShouldBeIncomplete()

    completeInterviewDetails()
    verifyInterviewDetails()

    getContinueButton().click()

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 6)

    completeTextboxSection(sections.STAFF, /staff-involved$/, 'Which staff have been involved in the investigation?')

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 5)

    completeTextboxSection(sections.WHY_BEHAVIOUR, /why-behaviour-occurred$/, 'Why did the behaviour occur?')

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    govukTaskListStatusShouldBe(sections.WHY_BEHAVIOUR, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 4)

    completeTextboxSection(sections.EVIDENCE, /evidence-secured$/, 'What evidence has been secured?')

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    govukTaskListStatusShouldBe(sections.WHY_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.EVIDENCE, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 3)

    completeTextboxSection(
      sections.USUAL_BEHAVIOUR,
      /usual-behaviour-presentation$/,
      'What is Testname User’s usual behaviour presentation?',
    )

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    govukTaskListStatusShouldBe(sections.WHY_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.EVIDENCE, 'Completed')
    govukTaskListStatusShouldBe(sections.USUAL_BEHAVIOUR, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 2)

    completeTextboxSection(sections.TRIGGERS, /triggers$/, 'What are Testname User’s triggers?')

    cy.findAllByText('Cannot save yet').should('have.length', 1)
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    govukTaskListStatusShouldBe(sections.WHY_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.EVIDENCE, 'Completed')
    govukTaskListStatusShouldBe(sections.USUAL_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.TRIGGERS, 'Completed')
    cy.findAllByText('Incomplete').should('have.length', 1)

    completeTextboxSection(
      sections.PROTECTIVE_FACTORS,
      /protective-factors$/,
      'What are the protective factors for Testname User?',
    )

    govukTaskListStatusShouldBe(sections.CHECK, 'Incomplete')
    govukTaskListStatusShouldBe(sections.DETAILS, 'Completed')
    govukTaskListStatusShouldBe(sections.STAFF, 'Completed')
    govukTaskListStatusShouldBe(sections.WHY_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.EVIDENCE, 'Completed')
    govukTaskListStatusShouldBe(sections.USUAL_BEHAVIOUR, 'Completed')
    govukTaskListStatusShouldBe(sections.TRIGGERS, 'Completed')
    govukTaskListStatusShouldBe(sections.PROTECTIVE_FACTORS, 'Completed')

    verifyCya()

    cy.findByText('Confirm and save report').click()

    cy.url().should('to.match', /confirmation$/)

    cy.findByRole('link', { name: 'View all CSIPs for Leeds (HMP)' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/manage-csips\?clear=true$/)

    cy.go('back')
    cy.url().should('to.match', /confirmation$/)
  })

  const govukTaskListStatusShouldBe = (link: string, status: string) => {
    cy.findByRole('link', { name: link }).parent().next().should('contain.text', status)
  }

  const allSectionsShouldBeIncomplete = () => {
    cy.findAllByText('Incomplete').should('have.length', 7)
    cy.findAllByText('Cannot save yet').should('have.length', 1)
  }

  const completeInterviewDetails = () => {
    cy.findByText(sections.DETAILS).click()
    cy.url().should('to.match', /\/record-investigation\/interviews-summary$/)

    cy.findByText('Add interview').click()

    const getInterviewDate = () => cy.findByRole('textbox', { name: /Interview date/ })
    const getIntervieweeName = () => cy.findByRole('textbox', { name: /Interviewee name/ })
    const getIntervieweeRole = () => cy.findByRole('radio', { name: /Role1/ })
    const getInterviewText = () => cy.findByRole('textbox', { name: /Comments \(optional\)/ })

    getInterviewDate().clear().type('01/01/2021', { delay: 0 })
    getIntervieweeName().clear().type('John Smith', { delay: 0 })
    getInterviewText().clear().type('Interviewee comment', { delay: 0 })
    getIntervieweeRole().click()

    getContinueButton().click()
  }

  const verifyInterviewDetails = () => {
    cy.findByRole('heading', { name: /Interviews summary/ }).should('be.visible')
    cy.findByRole('heading', { name: /Interview with John Smith/ }).should('be.visible')
    cy.findByRole('link', { name: /delete interview with john smith/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /delete-interview\/1$/)
    cy.go('back')

    cy.contains('dt', 'Interviewee').next().should('include.text', 'John Smith')
    cy.findByRole('link', { name: /change the interviewee’s name for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewee$/)
    cy.go('back')

    cy.contains('dt', 'Interview date').next().should('include.text', '1 January 2021')
    cy.findByRole('link', { name: /change the interview date for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewDate$/)
    cy.go('back')

    cy.contains('dt', 'Role').next().should('include.text', 'Role1')
    cy.findByRole('link', { name: /change the interviewee’s role for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#intervieweeRole$/)
    cy.go('back')

    cy.contains('dt', 'Comments').next().should('include.text', 'Interviewee comment')
    cy.findByRole('link', { name: /change the comments for interview 1/i })
      .should('be.visible')
      .click()
    cy.url().should('to.match', /interview-details\/1#interviewText$/)
    cy.go('back')
  }

  const completeTextboxSection = (section: string, url: string | RegExp, textboxName: string) => {
    cy.findByText(section).click()
    cy.url().should('to.match', url)
    cy.findByRole('textbox', { name: textboxName }).clear().type(`${textboxName} cypress e2e test`, { delay: 0 })
    getContinueButton().click()
  }

  const verifySummaryText = (heading: string, text: string) => {
    cy.contains('dt', heading).next().should('include.text', text)
  }

  const verifyCya = () => {
    cy.findByText(sections.CHECK).click()

    cy.findByRole('heading', { name: /Interview with John Smith/ }).should('be.visible')
    cy.contains('dt', 'Interviewee').next().should('include.text', 'John Smith')
    cy.contains('dt', 'Interview date').next().should('include.text', '1 January 2021')
    cy.contains('dt', 'Role').next().should('include.text', 'Role1')
    cy.contains('dt', 'Comments').next().should('include.text', 'Interviewee comment')

    verifySummaryText(sections.STAFF, 'Which staff have been involved in the investigation? cypress e2e test')
    verifySummaryText('Why the behaviour occurred', 'Why did the behaviour occur? cypress e2e test')
    verifySummaryText(sections.EVIDENCE, 'What evidence has been secured? cypress e2e test')
    verifySummaryText(
      sections.USUAL_BEHAVIOUR,
      'What is Testname User’s usual behaviour presentation? cypress e2e test',
    )
    verifySummaryText('Triggers', 'What are Testname User’s triggers? cypress e2e test')
    verifySummaryText('Protective factors', 'What are the protective factors for Testname User? cypress e2e test')
    verifyCyaChangeLinks()
  }

  const verifyCyaChangeLinks = () => {
    cy.findByText('Add, change or delete').click()
    cy.url().should('to.match', /interviews-summary$/)
    getContinueButton().click()
    cy.url().should('to.match', /check-answers$/)

    cy.findAllByText('Change').as('changeLinks')

    cy.get('@changeLinks').eq(0).click()
    cy.url().should('to.match', /staff-involved$/)
    cy.get('textarea').clear().type('staff-involved changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText(sections.STAFF, 'staff-involved changed')

    cy.get('@changeLinks').eq(1).click()
    cy.url().should('to.match', /why-behaviour-occurred$/)
    cy.get('textarea').clear().type('why-behaviour-occurred changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText('Why the behaviour occurred', 'why-behaviour-occurred changed')

    cy.get('@changeLinks').eq(2).click()
    cy.url().should('to.match', /evidence-secured$/)
    cy.get('textarea').clear().type('evidence-secured changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText(sections.EVIDENCE, 'evidence-secured changed')

    cy.get('@changeLinks').eq(3).click()
    cy.url().should('to.match', /usual-behaviour-presentation$/)
    cy.get('textarea').clear().type('usual-behaviour-presentation changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText(sections.USUAL_BEHAVIOUR, 'usual-behaviour-presentation changed')

    cy.get('@changeLinks').eq(4).click()
    cy.url().should('to.match', /triggers$/)
    cy.get('textarea').clear().type('triggers changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText('Triggers', 'triggers changed')

    cy.get('@changeLinks').eq(5).click()
    cy.url().should('to.match', /protective-factors$/)
    cy.get('textarea').clear().type('protective-factors changed', { delay: 0 })
    getContinueButton().click()
    verifySummaryText(sections.PROTECTIVE_FACTORS, 'protective-factors changed')
  }
})
