import { checkAxeAccessibility } from '../support/accessibilityViolations'

export type PageElement = Cypress.Chainable<JQuery>

type PageConfig = {
  skipA11yCheck: boolean
}

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(
    private readonly title: string,
    private readonly config: PageConfig = { skipA11yCheck: false },
  ) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)

    if (!this.config.skipA11yCheck) {
      checkAxeAccessibility()
    }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
