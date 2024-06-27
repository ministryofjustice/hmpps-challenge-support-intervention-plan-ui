import Page, { PageElement } from '../page'

export default class OnBehalfOfPage extends Page {
  constructor() {
    super(`Are you making this referral on someone else's behalf?`)
  }

  miniProfileHyperlink = (name: string): PageElement => cy.findByRole('link', { name: new RegExp(name, 'i') })
}
