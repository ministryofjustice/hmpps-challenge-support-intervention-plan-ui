import Page, { PageElement } from '../page'

export default class OnBehalfOfPage extends Page {
  constructor() {
    super(`Make a CSIP referral`)
  }

  miniProfileHyperlink = (name: string): PageElement => cy.findByRole('link', { name: new RegExp(name, 'i') })
}
