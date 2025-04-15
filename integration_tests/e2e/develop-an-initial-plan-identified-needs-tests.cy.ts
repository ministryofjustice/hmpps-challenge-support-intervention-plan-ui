import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../support/accessibilityViolations'
import { injectJourneyDataAndReload } from '../utils/e2eTestUtils'
import { Plan } from '../../server/@types/express'

context('test /develop-an-initial-plan/identified-needs', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisonerImage')
    cy.task('stubComponents')
    cy.task('stubCsipRecordSuccessPlanPending')
  })

  it('should test identified-needs with no needs', () => {
    navigateToTestPage()
    checkAxeAccessibility()

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents(false)
  })

  it('should test identified-needs with needs', () => {
    navigateToTestPage([
      {
        closedDate: '2024-08-02',
        createdDate: '2024-08-02',
        identifiedNeed: 'needB',
        intervention: 'intB',
        progression: 'progB',
        responsiblePerson: 'personB',
        targetDate: '2024-08-02',
      },
      {
        closedDate: '2024-08-01',
        createdDate: '2024-08-01',
        identifiedNeed: 'a need goes here',
        intervention: 'some intervention',
        progression: 'progression goes here',
        responsiblePerson: 'test stafferson',
        targetDate: '2024-08-01',
      },
    ])
    checkAxeAccessibility()

    cy.url().should('to.match', /\/identified-needs$/)

    validatePageContents(true)
  })

  const navigateToTestPage = (identifiedNeeds: Plan['identifiedNeeds'] = []) => {
    cy.signIn()
    injectJourneyDataAndReload(uuid, {
      prisoner: {
        firstName: "Tes'Name",
        lastName: 'User',
        cellLocation: '',
        prisonerNumber: 'A1111AA',
        prisonId: '',
      },
      plan: {
        identifiedNeeds,
      },
    })
    cy.visit(`${uuid}/develop-an-initial-plan/identified-needs`)
  }

  const validatePageContents = (withIdentifiedNeeds: boolean) => {
    cy.findByRole('link', { name: /^back/i }).should('not.exist')
    cy.findByRole('heading', { name: /Identified needs for Tes'name User/ }).should('be.visible')

    cy.get('details').invoke('attr', 'open').should('not.exist')
    cy.get('summary').click()
    cy.get('details').invoke('attr', 'open').should('exist')

    if (!withIdentifiedNeeds) {
      cy.findByText(/no identified needs recorded/i).should('be.visible')
      cy.findByRole('button', { name: /add identified need/i }).should('be.visible')
      cy.findByRole('button', { name: /add another identified need/i }).should('not.exist')
      cy.findByRole('button', { name: /continue/i }).should('not.exist')
    } else {
      cy.get('.govuk-summary-card')
        .first()
        .should('include.text', 'a need goes here')
        .next()
        .should('include.text', 'needB')
      cy.findByText(/no identified needs recorded/i).should('not.exist')
      cy.findByRole('button', { name: /add identified need/i }).should('not.exist')
      cy.findByRole('button', { name: /add another identified need/i }).should('be.visible')
      cy.findByRole('button', { name: /continue/i }).should('be.visible')
      cy.findByRole('heading', { name: /a need goes here/i }).should('be.visible')
      cy.findByText('1 August 2024').should('be.visible')
      cy.findAllByText(/identified need summary/i)
        .first()
        .siblings()
        .findByText(/a need goes here/i)
        .should('be.visible')
      cy.findByText(/some intervention/i).should('be.visible')
      cy.findByText(/test stafferson/i).should('be.visible')
      cy.findByText(/progression goes here/).should('be.visible')
    }

    cy.findByText('The plan should:').should('be.visible')
    cy.findByText(
      'be based on a multi-disciplinary approach, and communicated with all appropriate staff members',
    ).should('be.visible')
    cy.findByText('respond to the needs identified within the referral, investigation and other records').should(
      'be.visible',
    )
    cy.findByText('include achievable targets, developed and agreed with the prisoner').should('be.visible')
    cy.findByText('detail small steps to behaviour change, including the ’how’ and ’what it looks like’').should(
      'be.visible',
    )

    cy.findByText(
      'other types of support — for example, helping the prisoner improve their contact with family or engage more with activities',
    ).should('be.visible')
    cy.findByText(
      'intervention programmes — for example, behavioural programmes and other specialist services (if these match the prisoner’s needs)',
    ).should('be.visible')
    cy.findByText('lighter touch initiatives — for example, peer support schemes').should('be.visible')
  }
})
