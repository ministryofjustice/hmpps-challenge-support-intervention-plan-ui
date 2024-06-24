import Page, { PageElement } from '../page'

export default class OnBehalfOfPage extends Page {
  constructor() {
    super('Referrals (On Behalf Of) asdadasdwq is under construction...')
  }

  // TODO: replace this with assertion of data-qa=mini-profile being rendered (Left here for now to provide working example of cy.findByText)
  miniProfileDob = (): PageElement => cy.findByText('Date of birth').next('span')
}
