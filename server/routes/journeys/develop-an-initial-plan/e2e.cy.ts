import { v4 as uuidV4 } from 'uuid'

context('test /csip-record/:recordUuid/develop-an-initial-plan/start', () => {
  const uuid = uuidV4()

  const getContinueButton = () => cy.findByRole('button', { name: /Continue/ })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordGetSuccess')
    cy.task('stubPostPlan')
  })

  it('should deny access to non CSIP_PROCESSOR role', () => {
    cy.task('stubSignIn', { roles: [] })

    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`, {
      failOnStatusCode: false,
    })

    cy.url().should('to.match', /\/not-authorised$/)
    cy.visit(`${uuid}/develop-an-initial-plan/check-answers`, { failOnStatusCode: false })
    cy.url().should('to.match', /\/not-authorised$/)
  })

  it('happy path', () => {
    cy.signIn()
    cy.visit(`${uuid}/csip-record/02e5854f-f7b1-4c56-bec8-69e390eb8550/develop-an-initial-plan/start`)

    cy.url().should('to.match', /\/develop-an-initial-plan$/)

    cy.findByRole('radio', { name: 'Yes' }).click()
    cy.findByRole('textbox', { name: /What’s the main reason why Tes'name User needs a plan\?/ })
      .clear()
      .type('Reason they need a plan', { delay: 0 })

    getContinueButton().click()

    cy.url().should('to.match', /\/develop-an-initial-plan\/identified-needs$/)
    cy.findByText('No identified needs recorded.')
    cy.findByRole('button', { name: 'Add identified need' }).click()

    addNewIntervention()
    verifyIntervention()
    changeIntervention()

    getContinueButton().click()

    cy.url().should('to.match', /\/develop-an-initial-plan\/next-review-date/)

    cy.findByRole('textbox', { name: "When will you next review the plan with Tes'name User?" })
      .clear()
      .type(`19/01/2038`)

    getContinueButton().click()

    cy.url().should('to.match', /\/check-answers/)

    verifyCyaAndChange()
    finishJourney()
  })

  const addNewIntervention = () => {
    cy.url().should('to.match', /\/develop-an-initial-plan\/summarise-identified-need\/1$/)
    cy.findByRole('textbox', { name: 'Summarise the identified need' }).type('Summary', { delay: 0 })

    getContinueButton().click()

    cy.url().should('to.match', /\/develop-an-initial-plan\/intervention-details\/1$/)
    cy.findByRole('textbox', { name: 'What’s the planned intervention for this identified need?' }).type(
      'Intervention',
      { delay: 0 },
    )
    cy.findByRole('textbox', { name: 'Who’s responsible for taking action?' }).type('Responsible Person', { delay: 0 })
    cy.findByRole('textbox', { name: 'What’s the target date for progress?' }).type('19/01/2038', { delay: 0 })

    getContinueButton().click()

    cy.url().should('to.match', /\/develop-an-initial-plan\/record-actions-progress\/1$/)
    cy.findByRole('textbox', { name: 'Record any actions or progress (optional)' }).type('Actions and progress', {
      delay: 0,
    })

    getContinueButton().click()
  }

  const verifyIntervention = () => {
    cy.contains('dt', 'Identified need summary').next().should('include.text', 'Summary')
    cy.contains('dt', 'Planned intervention').next().should('include.text', 'Intervention')
    cy.contains('dt', 'Person responsible').next().should('include.text', 'Responsible Person')
    cy.contains('dt', 'Target date').next().should('include.text', '19 January 2038')
    cy.contains('dt', 'Actions and progress').next().should('include.text', 'Actions and progress')
  }

  const changeIntervention = () => {
    cy.findByRole('link', { name: 'Change the planned intervention 1 (Summary)' }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/intervention-details\/1#intervention$/)
    cy.focused().type('prepend ', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/identified-needs/)
    cy.contains('dt', 'Planned intervention').next().should('include.text', 'prepend Intervention')

    cy.findByRole('link', { name: 'Change the person responsible 1 (Summary)' }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/intervention-details\/1#responsiblePerson$/)
    cy.focused().type('prepend ', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/identified-needs/)
    cy.contains('dt', 'Person responsible').next().should('include.text', 'prepend Responsible Person')

    cy.findByRole('link', { name: 'Change the target date 1 (Summary)' }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/intervention-details\/1#targetDate$/)
    cy.focused().clear().type('20/01/2038', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/identified-needs/)
    cy.contains('dt', 'Target date').next().should('include.text', '20 January 2038')

    cy.findByRole('link', { name: 'Change the actions and progress 1 (Summary)' }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/record-actions-progress\/1#progression$/)
    cy.focused().type('prepend ', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/identified-needs/)
    cy.contains('dt', 'Actions and progress').next().should('include.text', 'prepend Actions and progress')

    cy.findByRole('link', { name: 'Change the summary of identified need 1 (Summary)' }).click()
    cy.url().should('to.match', /develop-an-initial-plan\/summarise-identified-need\/1#identifiedNeed$/)
    cy.focused().type('prepend ', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /develop-an-initial-plan\/identified-needs/)
    cy.contains('dt', 'Identified need summary').next().should('include.text', 'prepend Summary')
  }

  const verifyCyaAndChange = () => {
    cy.contains('dt', ' Case Manager').next().should('include.text', 'John Smith')
    cy.findByRole('link', { name: /Change the Case Manager/ }).click()
    cy.findByRole('radio', { name: 'No' }).click()
    cy.findByRole('textbox', { name: /Name of Case Manager/ })
      .clear()
      .type('Someone Else', { delay: 0 })

    getContinueButton().click()
    cy.url().should('to.match', /\/check-answers/)
    cy.contains('dt', ' Case Manager').next().should('include.text', 'Someone Else')

    cy.contains('dt', ' Reason for the plan').next().should('include.text', 'Reason they need a plan')
    cy.findByRole('link', { name: /Change the reason for the plan/ }).click()
    cy.focused().type('prepend ', { delay: 0 })

    getContinueButton().click()
    cy.url().should('to.match', /\/check-answers/)
    cy.contains('dt', ' Reason for the plan').next().should('include.text', 'prepend Reason they need a plan')

    cy.contains('dt', ' Next review date').next().should('include.text', '19 January 2038')
    cy.findByRole('link', { name: /Change the next review date/ }).click()
    cy.focused().clear().type('20/01/2038', { delay: 0 })

    getContinueButton().click()
    cy.url().should('to.match', /\/check-answers/)
    cy.contains('dt', ' Next review date').next().should('include.text', '20 January 2038')

    cy.findByRole('link', { name: 'Add, change or delete identified needs' }).click()
    cy.url().should('to.match', /\/develop-an-initial-plan\/identified-needs/)

    getContinueButton().click()
  }

  const finishJourney = () => {
    cy.findByRole('button', { name: 'Confirm and open CSIP' }).click()

    cy.url().should('to.match', /\/confirmation$/)
    cy.findByText("Initial plan recorded for Tes'name User").should('be.visible')
    cy.findByText('Status: CSIP open')

    cy.findByRole('link', { name: 'View all CSIPs for Leeds (HMP)' })
    cy.findByRole('link', { name: "View CSIP details for Tes'name User" })
  }
})
