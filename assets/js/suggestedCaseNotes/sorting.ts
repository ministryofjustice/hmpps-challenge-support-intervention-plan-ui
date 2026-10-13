import { announce, getWidget, replaceLinkWithButton, setQueryParam } from './controls'

const SELECTED_CLASSES = ['govuk-!-font-weight-bold', 'font-colour--black', 'govuk-link--no-underline']

const SORT_KEY_DATASET: Record<string, string> = {
  createdDate: 'sortCreatedDate',
  lastAmendedDate: 'sortLastAmendedDate',
}

const sortKey = (card: HTMLElement, field: string): number => {
  const value = card.dataset[SORT_KEY_DATASET[field] ?? ''] ?? ''
  return value === '' ? Number.NEGATIVE_INFINITY : Number(value)
}

const initSorting = () => {
  const widget = getWidget()
  const list = widget?.querySelector<HTMLElement>('[data-qa="suggested-case-notes-list"]')
  const links = Array.from(widget?.querySelectorAll<HTMLAnchorElement>('a[data-sort-option]') ?? [])
  if (!widget || !list || !links.length) return

  const cards = Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-qa="suggested-case-notes-card"]'))
  const initialPosition = new Map(cards.map((card, index) => [card, index]))
  const buttons = links.map(replaceLinkWithButton)
  let currentField = widget.dataset['sortField'] ?? ''

  const renderButtons = () => {
    buttons.forEach(button => {
      const selected = button.dataset['sortOption'] === currentField
      SELECTED_CLASSES.forEach(className => button.classList.toggle(className, selected))
      button.textContent = `${selected ? 'Sorted by' : 'Sort by'} ${button.dataset['sortLabel'] ?? ''}`
    })
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const field = button.dataset['sortOption'] ?? ''
      if (field === currentField) return

      currentField = field
      const sorted = [...cards].sort(
        (a, b) => sortKey(b, field) - sortKey(a, field) || initialPosition.get(a)! - initialPosition.get(b)!,
      )
      list.append(...sorted)

      widget.dataset['sortField'] = field
      renderButtons()
      setQueryParam('sortField', field)
      announce(widget, `Case notes sorted by ${button.dataset['sortLabel'] ?? ''}`)
    })
  })
}

export default initSorting
