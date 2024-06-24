import Page, { PageElement } from '../page'

export default class OnBehalfOfPage extends Page {
  constructor() {
    super('Referrals (On Behalf Of) asdadasdwq is under construction...')
  }

  miniProfileDob = (): PageElement => cy.findByText('Date of birth').next('span')
}
