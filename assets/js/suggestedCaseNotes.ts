const TRUNCATION_THRESHOLD = 100
const WORDS_BEFORE_HIGHLIGHT = 10

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

const truncateBeforeHighlight = (content: HTMLElement): boolean => {
  const fragments = Array.from(content.querySelectorAll<HTMLElement>('[data-truncatable-fragment]'))
  const firstHighlightIndex = fragments.findIndex(fragment => fragment.dataset['truncatableFragment'] === 'highlight')
  if (firstHighlightIndex < 0) return false

  const wordsBeforeHighlight = fragments
    .slice(0, firstHighlightIndex)
    .reduce((count, fragment) => count + countWords(fragment.textContent ?? ''), 0)
  if (wordsBeforeHighlight <= WORDS_BEFORE_HIGHLIGHT) return false

  let wordsToRemove = wordsBeforeHighlight - WORDS_BEFORE_HIGHLIGHT
  const visibleFragments = fragments.slice(firstHighlightIndex)
  const precedingFragments = fragments.slice(0, firstHighlightIndex)

  for (let index = precedingFragments.length - 1; index >= 0 && wordsToRemove > 0; index -= 1) {
    const fragment = precedingFragments[index]!
    const words = (fragment.textContent ?? '').trim().split(/\s+/).filter(Boolean)
    if (words.length <= wordsToRemove) {
      wordsToRemove -= words.length
      continue
    }

    const shortenedFragment = fragment.cloneNode(true) as HTMLElement
    shortenedFragment.textContent = words.slice(words.length - wordsToRemove).join(' ')
    visibleFragments.unshift(shortenedFragment)
    wordsToRemove = 0
  }

  content.replaceChildren('… ')
  visibleFragments.forEach((fragment, index) => {
    if (index > 0) content.append(' ')
    content.append(fragment)
  })
  return true
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
    wrapper.setAttribute('aria-hidden', 'true')
    truncateBeforeHighlight(content)
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
      wrapper.setAttribute('aria-hidden', 'false')
    } else {
      wrapper.classList.add('case-note-card__text-wrapper--truncated')
      wrapper.setAttribute('aria-hidden', 'true')
      truncateBeforeHighlight(content)
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
