import replaceHighlightLinkWithButton from './highlighting'
import replaceSortLinksWithButtons from './sorting'
import setUpCaseNoteExpanding from './expanding'

export const initSuggestedCaseNotes = () => {
  replaceHighlightLinkWithButton()
  replaceSortLinksWithButtons()
  setUpCaseNoteExpanding()
}
