context('Make a Referral Journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubGetPrisoner')
  })

  it('happy path', () => {
    cy.signIn()
    cy.visit('/prisoners/A1111AA/referral/start')

    cy.findByRole('radio', { name: /no/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('combobox').select(1)
    cy.findByRole('combobox').invoke('attr', 'val').as('areaOfWork', { type: 'static' })
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('radio', { name: /reactive/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /incident details/i }).should('be.visible')
    cy.findByRole('heading', { name: /when did the incident occur\?/i }).should('be.visible')
    cy.findByRole('input', { name: /date of incident/i }).type('06/07/2024')
    cy.findByRole('input', { name: /hour/i }).type('12')
    cy.findByRole('input', { name: /minute/i }).type('24')
    cy.findByRole('combobox', { name: /where did the incident occur\?/i }).select(1)
    cy.findByRole('combobox', { name: /where did the incident occur\?/i })
      .invoke('attr', 'val')
      .as('incidentLocation', { type: 'static' })
    cy.findByRole('combobox', { name: /what was the incident type\?/i }).select(1)
    cy.findByRole('combobox', { name: /what was the incident type\?/i })
      .invoke('attr', 'val')
      .as('incidentType', { type: 'static' })
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /incident involvement/i }).should('be.visible')
    cy.findByRole('radio', { name: /other/i }).click()
    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('textbox').type('TestStaff Member')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /describe the incident and concerns/i }).should('be.visible')
    cy.findByText(/the description could include/i).should('not.be.visible')
    cy.findByText(/what type of information to include/i).click()
    cy.findByText(/the description could include/i).should('be.visible')
    cy.findByRole('textbox').type('incident concerns foobar123')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /what reasons have been given for the incident\?/i }).should('be.visible')
    cy.findByText(/include any reasons given/i).should('not.be.visible')
    cy.findByText(/what type of information to include/i).click()
    cy.findByText(/include any reasons given/i).should('not.be.visible')
    cy.findByRole('textbox').type('incident reasons foobar123')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /what are the contributory factors\?/i }).should('be.visible')
    cy.findByRole('checkbox', { name: /bullying/i }).click()
    cy.findByRole('checkbox', { name: /medication/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findAllByRole('link', { name: /add comment/i }).should('have.length', 2)
    cy.findAllByRole('link', { name: /add comment/i })
      .first()
      .should('be.visible')
      .click()
    cy.findByRole('link', { name: /back/i }).click()
    cy.findAllByRole('link', { name: /add comment/i })
      .first()
      .should('be.visible')
      .click()
    cy.findByRole('textbox').type('factor comment')
    cy.findByRole('button', { name: /continue/i }).click()
    cy.findByRole('link', { name: /edit comment/i }).should('be.visible')
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /is the safer custody team already aware of this referral\?/i }).should(
      'be.visible',
    )
    cy.findByRole('radio', { name: /yes/i }).click()
    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('heading', { name: /add additional information \(optional\)\?/i }).should('be.visible')
    cy.findByRole('textbox').type('additional info')
    cy.findByRole('button', { name: /continue/i }).click()

    // TODO: We need to check the answers given are correct on CYA page, but it doesnt exist yet

    // We use this for now as CYA page isn't implemented - change this to click back link when it exists
    cy.go('back')

    cy.findByDisplayValue('additional info').should('be.visible')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByRole('link', { name: /edit comment/i }).should('be.visible')
    cy.findByRole('link', { name: /edit comment/i }).click()
    cy.findByDisplayValue('factor comment').should('be.visible')
    cy.findByRole('link', { name: /back/i }).click()
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByRole('checkbox', { name: /bullying/i }).should('be.checked')
    cy.findByRole('checkbox', { name: /medication/i }).should('be.checked')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByDisplayValue('incident reasons foobar123').should('be.visible')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByDisplayValue('incident concerns foobar123').should('be.visible')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByDisplayValue('TestStaff Member').should('be.visible')
    cy.findByRole('radio', { name: /yes/i }).should('be.checked')
    cy.findByRole('radio', { name: /other/i }).should('be.checked')
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByDisplayValue('06/07/2024').should('be.visible')
    cy.findByDisplayValue('12').should('be.visible')
    cy.findByDisplayValue('24').should('be.visible')
    cy.get('@incidentLocation').then(val => {
      cy.findByDisplayValue(val as unknown as string).should('be.visible')
    })
    cy.get('@incidentType').then(val => {
      cy.findByDisplayValue(val as unknown as string).should('be.visible')
    })
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByRole('radio', { name: /reactive/i }).should('be.checked')
    cy.findByRole('link', { name: /back/i }).click()

    cy.get('@areaOfWork').then(val => {
      cy.findByDisplayValue(val as unknown as string).should('be.visible')
    })
    cy.findByRole('link', { name: /back/i }).click()

    cy.findByRole('radio', { name: /no/i }).should('be.checked')
  })
})
