import Page, { PageElement } from '../page'

export default class OnBehalfOfPage extends Page {
  constructor() {
    super('Referrals (On Behalf Of) asdadasdwq is under construction...')
  }

  miniProfileHyperlink = (name: string): PageElement => cy.findByRole('link', { name: new RegExp(name, 'i') })
}
