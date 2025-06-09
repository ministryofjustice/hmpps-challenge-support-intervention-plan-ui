import { JourneyData } from '../server/@types/express'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode: boolean }): Chainable<string>
      verifyJourneyData(uuid: string, validator: (journeyData: JourneyData) => void): Chainable<void>
      verifyAuditEvents(events: object[]): Chainable<unknown>
      pageCheckCharacterThresholdMessage(
        element: Cypress.Chainable<JQuery<HTMLElement>>,
        maxChars: number,
        threshold?: number,
      ): Chainable<void>
    }
  }
}
