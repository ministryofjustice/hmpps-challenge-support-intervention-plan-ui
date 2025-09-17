import { expect } from 'chai'
import { resetStubs } from '../mockApis/wiremock'

context('Healthcheck', () => {
  afterEach(() => {
    resetStubs()
  })

  context('All healthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing')
      cy.task('stubTokenVerificationPing')
      cy.task('stubComponentsPing')
      cy.task('stubCSIPPing')
      cy.task('stubPrisonerSearchPing')
      cy.task('stubPrisonPing')
    })

    it('Health check page is visible and UP', () => {
      cy.request('/health').its('body.status').should('equal', 'UP')
    })

    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body.productId').should('equal', 'DPS094')
    })

    it('Reports correctly when services are UP', () => {
      cy.request({ url: '/health', method: 'GET' }).then(response => {
        expect(response.body.components.hmppsAuth.status).to.equal('UP')
        expect(response.body.components.tokenVerification.status).to.equal('UP')
        expect(response.body.components.csipApi.status).to.equal('UP')
        expect(response.body.components.prisonerSearchApi.status).to.equal('UP')
        expect(response.body.components.prisonApi.status).to.equal('UP')
        expect(response.body.components.componentApi.status).to.equal('UP')
      })
    })
  })

  context('Unhealthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing', 500)
      cy.task('stubTokenVerificationPing', 500)
      cy.task('stubComponentsPing', 500)
      cy.task('stubCSIPPing', 500)
      cy.task('stubPrisonerSearchPing', 500)
      cy.task('stubPrisonPing', 500)
    })

    it('Health check page is visible and DOWN', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).its('body.status').should('equal', 'DOWN')
    })

    it('Reports correctly when services are DOWN', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
        expect(response.body.components.hmppsAuth.status).to.equal('DOWN')
        expect(response.body.components.hmppsAuth.details.status).to.equal(500)
        expect(response.body.components.tokenVerification.status).to.equal('DOWN')
        expect(response.body.components.tokenVerification.details.status).to.equal(500)
        expect(response.body.components.csipApi.status).to.equal('DOWN')
        expect(response.body.components.csipApi.details.status).to.equal(500)
        expect(response.body.components.prisonerSearchApi.status).to.equal('DOWN')
        expect(response.body.components.prisonerSearchApi.details.status).to.equal(500)
        expect(response.body.components.prisonApi.status).to.equal('DOWN')
        expect(response.body.components.prisonApi.details.status).to.equal(500)
        expect(response.body.components.componentApi.status).to.equal('DOWN')
        expect(response.body.components.componentApi.details.status).to.equal(500)
      })
    })
  })
})
