import { announce, getWidget, replaceLinkWithButton, setQueryParam } from './controls'

const NO_HIGHLIGHTS_CLASS = 'suggested-case-notes--no-highlights'

const replaceHighlightLinkWithButton = () => {
  const widget = getWidget()
  const link = widget?.querySelector<HTMLAnchorElement>('a[data-qa="toggle-highlights"]')
  if (!widget || !link) return

  const button = replaceLinkWithButton(link)

  button.addEventListener('click', () => {
    const highlightsOff = widget.classList.toggle(NO_HIGHLIGHTS_CLASS)
    button.textContent = highlightsOff ? 'Turn on highlights' : 'Turn off highlights'
    setQueryParam('suggestedCaseNotesHighlighting', highlightsOff ? 'off' : 'on')
    announce(widget, highlightsOff ? 'Highlights turned off' : 'Highlights turned on')
  })
}

export default replaceHighlightLinkWithButton
