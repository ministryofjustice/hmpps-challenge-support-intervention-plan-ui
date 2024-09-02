import { v4 as uuidV4 } from 'uuid'
import { injectJourneyDataAndReload } from '../integration_tests/utils/e2eTestUtils'

context('test errorHandler', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should redirect to /referral', () => {
    cy.task('stubGetPrisoner500')
    cy.task('stubGetPrisonerImage')
    cy.signIn()
    cy.visit(`${uuid}/prisoners/A1111AA/referral/start`, { failOnStatusCode: false })
    cy.findByText(/sorry, there is a problem with the service/i).should('be.visible')
  })

  it('should stuff', () => {
    cy.task('stubGetPrisonerImage')
    cy.task('stubAreaOfWork')
    cy.task('stubIncidentLocation')
    cy.task('stubIncidentType')
    cy.task('stubIncidentInvolvement')
    cy.task('stubContribFactors')
    cy.task('stubCsipRecordPostSuccess')
    injectJourneyDataAndReload(uuid, {
      referral: {
        incidentDate: 'test', // invalid date here
      },
      prisoner: {
        firstName: 'foo',
        lastName: 'bar',
        prisonerNumber: 'A1111AA',
        cellLocation: '',
        prisonId: '',
      },
    })
    cy.signIn()
    cy.visit(`${uuid}/referral/details`)
    cy.findByText(/sorry, there is a problem with the service/i).should('be.visible')
  })
})
