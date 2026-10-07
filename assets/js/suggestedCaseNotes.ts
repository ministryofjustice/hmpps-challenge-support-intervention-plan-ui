const TRUNCATION_THRESHOLD = 60

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

const truncateContent = (content: HTMLElement): void => {
  const fragments = Array.from(content.querySelectorAll<HTMLElement>('[data-truncatable-fragment]'))
  const visibleFragments: HTMLElement[] = []
  let wordsRemaining = TRUNCATION_THRESHOLD

  for (const fragment of fragments) {
    if (wordsRemaining <= 0) break

    const isHighlight = fragment.dataset['truncatableFragment'] === 'highlight'
    const words = (fragment.textContent ?? '').trim().split(/\s+/).filter(Boolean)
    if (words.length <= wordsRemaining) {
      visibleFragments.push(fragment)
      wordsRemaining -= words.length
    } else if (isHighlight) {
      wordsRemaining = 0
    } else {
      const shortenedFragment = fragment.cloneNode(true) as HTMLElement
      shortenedFragment.textContent = words.slice(0, wordsRemaining).join(' ')
      visibleFragments.push(shortenedFragment)
      wordsRemaining = 0
    }
  }

  content.replaceChildren()
  visibleFragments.forEach((fragment, index) => {
    if (index > 0) content.append(' ')
    content.append(fragment)
  })
  content.append('…')
}

const applyCardTruncation = (card: HTMLElement): boolean => {
  let hasTruncatedContent = false

  card.querySelectorAll<HTMLElement>('[data-truncatable-content]').forEach(content => {
    if (countWords(content.textContent ?? '') <= TRUNCATION_THRESHOLD) return

    hasTruncatedContent = true
    const wrapper = content.closest<HTMLElement>('[data-truncatable-text]')
    if (!wrapper) return

    wrapper.dataset['fullHtml'] = content.innerHTML
    wrapper.classList.add('case-note-card__text-wrapper--truncated')
    truncateContent(content)
  })

  return hasTruncatedContent
}

const setCardExpanded = (card: HTMLElement, expanded: boolean) => {
  card.querySelectorAll<HTMLElement>('[data-truncatable-text]').forEach(wrapper => {
    const content = wrapper.querySelector<HTMLElement>('[data-truncatable-content]')
    const fullHtml = wrapper.dataset['fullHtml']
    if (!content || !fullHtml) return

    content.innerHTML = fullHtml
    if (expanded) {
      wrapper.classList.remove('case-note-card__text-wrapper--truncated')
    } else {
      wrapper.classList.add('case-note-card__text-wrapper--truncated')
      truncateContent(content)
    }
  })

  const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
  if (!button) return

  button.textContent = expanded ? 'Minimise case note' : 'Expand case note'
  button.setAttribute('aria-expanded', String(expanded))
}

const syncExpandAllButton = (button: HTMLButtonElement, cards: HTMLElement[]) => {
  const cardButtons = cards
    .map(card => card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn'))
    .filter((cardButton): cardButton is HTMLButtonElement => cardButton !== null && !cardButton.hidden)
  const allExpanded = cardButtons.length > 0 && cardButtons.every(cardButton => cardButton.getAttribute('aria-expanded') === 'true')

  button.textContent = allExpanded ? 'Minimise all case notes' : 'Expand all case notes'
  button.setAttribute('aria-expanded', String(allExpanded))
}

export const initSuggestedCaseNotes = () => {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-qa="suggested-case-notes-card"]'))
  const expandAllButton = document.querySelector<HTMLButtonElement>('[data-qa="expand-all-case-notes"]')

  cards.forEach(card => {
    const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
    if (!button || !applyCardTruncation(card)) return

    button.hidden = false
    button.addEventListener('click', () => {
      setCardExpanded(card, button.getAttribute('aria-expanded') !== 'true')
      if (expandAllButton) syncExpandAllButton(expandAllButton, cards)
    })
  })

  if (!expandAllButton) return

  const hasExpandableCards = cards.some(card => {
    const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
    return button !== null && !button.hidden
  })
  if (!hasExpandableCards) return

  expandAllButton.hidden = false
  syncExpandAllButton(expandAllButton, cards)
  expandAllButton.addEventListener('click', () => {
    const expand = expandAllButton.getAttribute('aria-expanded') !== 'true'
    cards.forEach(card => {
      const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
      if (button && !button.hidden) setCardExpanded(card, expand)
    })
    syncExpandAllButton(expandAllButton, cards)
  })
}
