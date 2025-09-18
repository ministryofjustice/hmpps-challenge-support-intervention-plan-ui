import { expect } from 'chai'

context('Healthcheck', () => {
  context('All healthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing')
      cy.task('stubTokenVerificationPing')
      cy.task('stubPrisonApiPing')
      cy.task('stubPrisonerSearchApiPing')
      cy.task('stubComponentsPing')
      cy.task('stubCsipApiPing')
    })

    it('Health check page is visible and services report as UP', () => {
      cy.request({ url: '/health', method: 'GET' }).then(response => {
        expect(response.body.status).to.equal('UP')
        expect(response.body.components.hmppsAuth.status).to.equal('UP')
        expect(response.body.components.tokenVerification.status).to.equal('UP')
        expect(response.body.components.componentApi.status).to.equal('UP')
        expect(response.body.components.csipApi.status).to.equal('UP')
        expect(response.body.components.prisonerSearchApi.status).to.equal('UP')
        expect(response.body.components.prisonApi.status).to.equal('UP')
      })
    })

    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body').should('exist')
    })
  })

  context('Some unhealthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing')
      cy.task('stubTokenVerificationPing', 500)
      cy.task('stubPrisonApiPing')
      cy.task('stubPrisonerSearchApiPing')
      cy.task('stubComponentsPing')
      cy.task('stubCsipApiPing')
    })

    it('Reports correctly when token verification down', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
        expect(response.body.status).to.equal('DOWN')
        expect(response.body.components.hmppsAuth.status).to.equal('UP')
        expect(response.body.components.tokenVerification.status).to.equal('DOWN')
        expect(response.body.components.tokenVerification.details).to.contain({ status: 500 })
        expect(response.body.components.componentApi.status).to.equal('UP')
        expect(response.body.components.csipApi.status).to.equal('UP')
        expect(response.body.components.prisonerSearchApi.status).to.equal('UP')
        expect(response.body.components.prisonApi.status).to.equal('UP')
      })
    })
    
    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body').should('exist')
    })
  })
})
