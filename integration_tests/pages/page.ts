import { Result } from 'axe-core'

export type PageElement = Cypress.Chainable<JQuery>

type PageConfig = {
  skipA11yCheck: boolean
}

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  constructor(
    private readonly title: string,
    private readonly config: PageConfig = { skipA11yCheck: false },
  ) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)

    if (!this.config.skipA11yCheck) {
      cy.injectAxe()
      cy.configureAxe({
        rules: [
          // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
          { id: 'aria-allowed-attr', reviewOnFail: true },
          // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
          { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
        ],
      })
      cy.checkA11y(undefined, undefined, this.logAccessibilityViolations)
    }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  logAccessibilityViolations(violations: Result[]): void {
    cy.task('logAccessibilityViolationsSummary', `Accessibility violations detected: ${violations.length}`)

    const violationData = violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
      nodeTargets: nodes.map(node => node.target).join(' - '),
    }))

    cy.task('logAccessibilityViolationsTable', violationData)
  }
}
