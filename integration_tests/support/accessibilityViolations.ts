import { Result, Spec } from 'axe-core'

const logAccessibilityViolations = (violations: Result[]) => {
  cy.task('logAccessibilityViolationsSummary', `Accessibility violations detected: ${violations.length}`)

  const violationData = violations.map(violation => ({
    ...violation,
    nodes: violation.nodes.length,
    nodeTargets: violation.nodes.map(node => node.target).join(' - '),
  }))

  cy.task('logAccessibilityViolationsTable', violationData)
}

export const checkAxeAccessibility = () => {
  cy.injectAxe()
  cy.configureAxe({
    rules: [
      // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
      { id: 'aria-allowed-attr', reviewOnFail: true },
      // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
      { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
      { id: 'empty-table-header', reviewOnFail: true },
    ],
  } as Spec)
  cy.checkA11y(undefined, undefined, logAccessibilityViolations)

  checkStyleRules()
}

const checkStyleRules = () => {
  // No un-curly apostrophes in text
  cy.findByText(/[\s\S]*'[\s\S]*/i).should('not.exist')
}

export default {
  logAccessibilityViolationsSummary: (message: string): null => {
    // eslint-disable-next-line no-console
    console.log(message)

    return null
  },
  logAccessibilityViolationsTable: (violations: Result[]): null => {
    // eslint-disable-next-line no-console
    console.table(violations)

    return null
  },
}
