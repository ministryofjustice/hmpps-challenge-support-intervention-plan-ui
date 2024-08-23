import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../../../../../integration_tests/utils/e2eTestUtils'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('test /record-investigation/check-answers', () => {
  const uuid = uuidV4()
  const START_URL = `${uuid}/prisoners/A1111AA/referral/start`
  const PAGE_URL = `${uuid}/referral/check-answers`
  const ESCAPE_LITTLE = '<script>alert("Test User")</script>'
  const ESCAPE_AND_FORMAT_EXPECTED =
    "\n      Text\n      \n        • Bullet 1\n        • Bullet 2\n        • Bullet 3\n        \n        Paragraph\n        \n        <script>alert('xss');</script>\n        \n        <button>also should be escaped</button>\n    "
  const ESCAPE_AND_FORMAT = `Text

  • Bullet 1
  • Bullet 2
  • Bullet 3
  
  Paragraph
  
  <script>alert('xss');</script>
  
  <button>also should be escaped</button>`

  const getContinueButton = () => cy.findByRole('button', { name: /continue/i })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIntervieweeRoles')
    cy.task('stubDecisionSignerRoles')
    cy.task('stubContribFactors')
    cy.task('stubIncidentInvolvement')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisoner')

    cy.signIn()
    cy.visit(START_URL)

    injectJourneyDataAndReload(uuid, {
      referral: {
        assaultedStaffName: 'Jimmy',
        contributoryFactors: [{ factorType: { code: 'CODE1', description: 'Factor1' } }],
        descriptionOfConcern: 'idklol',
        incidentDate: '22 August 2024',
        incidentInvolvement: { code: 'A', description: 'TypeA' },
        incidentLocation: { code: 'A', description: 'LocationA' },
        incidentType: { code: 'A', description: 'IncidentA' },
        incidentTime: '01:01',
        isOnBehalfOfReferral: false,
        knownReasons: 'idklol',
        refererArea: { code: 'A', description: 'AreaA' },
        referredBy: 'Test Person',
        staffAssaulted: false,
      },
    })

    cy.visit(PAGE_URL)

    cy.url().should('to.match', /\/check-answers/)
    checkAxeAccessibility()
  })

  it('should redirect to something on failure', () => {
    cy.task('stubCsipRecordPostFailure')
    cy.findByRole('button', { name: /Confirm and send/i }).click()
    cy.url().should('to.match', /\/check-answers/)
    cy.findByText('There is a problem').should('be.visible')
  })

  it('should be able to change answers and proceed to confirmation', () => {
    cy.task('stubCsipRecordPostSuccess')

    cy.findByRole('heading', { name: /Check your answers before sending the referral/ }).should('be.visible')

    checkBehalfOf()
    checkNameOfReferrer()
    checkAreaOfWork()
    checkProactiveReactive()

    checkProactiveReactiveChange()
    switchBackToReactive()

    checkDateOfIncident()
    checkTimeOfIncident()
    checkLocationOfIncident()
    checkIncidentType()
    checkIncidentInvolvement()
    checkStaffAssaulted()
    checkDescriptionOfConcern()
    checkReasonsGiven()
    checkContributoryFactors()
    checkCommentOnFactor2()
    checkSaferCustody()
    checkAdditionalInformation()

    continueToConfirmation()
  })

  const switchBackToReactive = () => {
    cy.findByRole('link', { name: /Change if the referral is proactive or reactive/i })
      .should('be.visible')
      .click()

    cy.findByRole('radio', { name: /Reactive/i }).click()
    getContinueButton().click()
  }

  const checkBehalfOf = () => {
    cy.contains('dt', 'Referral made on behalf of someone else').next().should('include.text', `No`)
    cy.findByRole('link', { name: /Change if the referral is being made on behalf of someone else or not/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /on-behalf-of/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('radio', { name: /Yes/i }).should('be.focused').click()
    getContinueButton().click()
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Referral made on behalf of someone else').next().should('include.text', `Yes`)
    cy.contains('dt', 'Name of referrer').next().should('include.text', `Test Person`)
  }

  const checkNameOfReferrer = () => {
    cy.findByRole('link', { name: /Change name of referrer/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /referrer/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox').should('be.focused').clear().type(ESCAPE_LITTLE, { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Name of referrer').next().should('include.text', `<script>alert("Test User")</script>`)
  }

  const checkAreaOfWork = () => {
    cy.contains('dt', 'Area of work').next().should('include.text', `AreaA`)
    cy.findByRole('link', { name: /Change area of work/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /referrer/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('combobox', { name: 'Which area do they work in?' }).should('be.focused').select('AreaB')
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Area of work').next().should('include.text', `AreaB`)
  }

  const checkProactiveReactive = () => {
    cy.contains('dt', 'Proactive or reactive referral').next().should('include.text', `Reactive`)
    cy.findByRole('link', { name: /Change if the referral is proactive or reactive/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /proactive-or-reactive/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('radio', { name: /Proactive/i })
      .should('be.focused')
      .click()
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Proactive or reactive referral').next().should('include.text', `Proactive`)
  }

  const checkDateOfIncident = () => {
    cy.contains('dt', 'Date of incident').next().should('include.text', `22 August 2024`)
    cy.findByRole('link', { name: /Change date of incident/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /details/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox', { name: 'Date of incident' }).should('be.focused').clear().type('21/08/2024', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Date of incident').next().should('include.text', `21 August 2024`)
  }

  const checkTimeOfIncident = () => {
    cy.contains('dt', 'Time of incident').next().should('include.text', `01:01`)
    cy.findByRole('link', { name: /Change time of incident/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /details/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox', { name: 'Hour' }).should('be.focused').clear().type('2', { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Time of incident').next().should('include.text', `2`)
  }

  const checkLocationOfIncident = () => {
    cy.contains('dt', 'Location of incident').next().should('include.text', `LocationA`)
    cy.findByRole('link', { name: /Change location of incident/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /details/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('combobox', { name: 'Where did the incident occur?' }).should('be.focused').select('LocationB')
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Location of incident').next().should('include.text', `LocationB`)
  }

  const checkIncidentType = () => {
    cy.contains('dt', 'Incident type').next().should('include.text', `TypeA`)
    cy.findByRole('link', { name: /Change incident type/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /details/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('combobox', { name: 'What was the incident type?' }).should('be.focused').select('TypeB')
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Incident type').next().should('include.text', `TypeB`)
  }

  const checkIncidentInvolvement = () => {
    cy.contains('dt', 'Prisoner involvement').next().should('include.text', `TypeA`)
    cy.findByRole('link', { name: /Change how the prisoner was involved/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /involvement/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('radio', { name: /Factor1/i }).should('be.focused')
    cy.findByRole('radio', { name: /Factor2/i }).click()
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Prisoner involvement').next().should('include.text', `Factor2`)
  }

  const checkStaffAssaulted = () => {
    cy.contains('dt', 'Staff assaulted').next().should('include.text', `No`)
    cy.findByRole('link', { name: /Change if a staff member was assaulted or not/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /involvement/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('radio', { name: /No/i })
    cy.findByRole('radio', { name: /Yes/i }).should('be.focused').click()

    cy.findByRole('textbox').clear().type(ESCAPE_LITTLE, { delay: 0 })

    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Staff assaulted').next().should('include.text', `Yes`)
    cy.contains('dt', 'Names of staff assaulted').next().should('include.text', `<script>alert("Test User")</script>`)
  }

  const checkDescriptionOfConcern = () => {
    cy.contains('dt', 'Description of incident and concerns').next().should('include.text', `idklol`)
    cy.findByRole('link', { name: /Change the description of the incident and concerns/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /description/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox').should('be.focused').clear().type(ESCAPE_AND_FORMAT, { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Description of incident and concerns').next().should('include.text', ESCAPE_AND_FORMAT_EXPECTED)
  }

  const checkReasonsGiven = () => {
    cy.contains('dt', 'Reasons given for the incident').next().should('include.text', `idklol`)
    cy.findByRole('link', { name: /Change the reasons given for the incident/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /reasons/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox').should('be.focused').clear().type(ESCAPE_AND_FORMAT, { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Reasons given for the incident').next().should('include.text', ESCAPE_AND_FORMAT_EXPECTED)
  }

  const checkContributoryFactors = () => {
    cy.contains('dt', 'Contributory factors').next().should('include.text', `Factor1`)
    cy.findByRole('link', { name: /Change the contributory factors/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /contributory-factors/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('checkbox', { name: /Factor1/i }).should('be.focused')
    cy.findByRole('checkbox', { name: /Factor2/i }).click()
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Contributory factors').next().should('include.text', `Factor2`)
  }

  const checkCommentOnFactor2 = () => {
    cy.contains('dt', 'Comment on factor2 factors').next().should('include.text', `Not provided`)
    cy.findByRole('link', { name: /Change the comment on factor2 factors/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /code2-comment/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox').should('be.focused').clear().type(ESCAPE_AND_FORMAT, { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Comment on factor2 factors').next().should('include.text', ESCAPE_AND_FORMAT_EXPECTED)
  }

  const checkSaferCustody = () => {
    cy.contains('dt', 'Safer Custody aware of referral').next().should('include.text', `I don’t know`)
    cy.findByRole('link', { name: /Change if Safer Custody are aware of the referral or not/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /safer-custody/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('radio', { name: /Yes/i }).should('be.focused').click()
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Safer Custody aware of referral').next().should('include.text', `Yes`)
  }

  const checkAdditionalInformation = () => {
    cy.contains('dt', 'Other information relating to this referral').next().should('include.text', `Not provided`)
    cy.findByRole('link', { name: /Change the additional information relating to the referral/i })
      .should('be.visible')
      .click()

    cy.url().should('to.match', /additional-information/)
    cy.findByRole('link', { name: /^back/i })
      .should('have.attr', 'href')
      .and('match', /check-answers/)

    cy.findByRole('textbox').should('be.focused').clear().type(ESCAPE_AND_FORMAT, { delay: 0 })
    getContinueButton().click()
    cy.url().should('to.match', /check-answers/)
    cy.contains('dt', 'Other information relating to this referral')
      .next()
      .should('include.text', ESCAPE_AND_FORMAT_EXPECTED)
  }

  const checkProactiveReactiveChange = () => {
    cy.contains('dt', 'Date of occurrence').next().should('include.text', `22 August 2024`)
    cy.contains('dt', 'Time of occurrence').next().should('include.text', `01:01`)
    cy.contains('dt', 'Location of occurrence').next().should('include.text', `LocationA`)
    cy.contains('dt', 'Main concern').next().should('include.text', `IncidentA`)
    cy.contains('dt', 'Description of behaviour and concerns').next().should('include.text', `idklol`)
    cy.contains('dt', 'Reasons given for the behaviour').next().should('include.text', `idklol`)
  }

  const continueToConfirmation = () => {
    cy.findByRole('button', { name: /Confirm and send/i }).click()
    cy.url().should('to.match', /\/confirmation(#[A-z]+)?/)
  }
})
