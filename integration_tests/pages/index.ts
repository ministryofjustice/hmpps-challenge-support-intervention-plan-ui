import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('How to make a CSIP referral')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
