import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('CSIP (Challenge, Support and Intervention Plans)')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
