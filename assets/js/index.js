import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import Card from './card'
import { nodeListForEach } from './utils'

govukFrontend.initAll()
mojFrontend.initAll()

var $cards = document.querySelectorAll('.card--clickable')
nodeListForEach($cards, function ($card) {
  new Card($card)
})
nodeListForEach(document.querySelectorAll('textarea'), function (textarea) {
  if (textarea.getAttribute('rows') === '1') {
    textarea.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.currentTarget.closest('form').submit()
      }
    })
  }
})
