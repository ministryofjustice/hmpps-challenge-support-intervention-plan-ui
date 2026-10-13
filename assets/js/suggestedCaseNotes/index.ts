import initHighlighting from './highlighting'
import initSorting from './sorting'
import initTruncation from './truncation'

export const initSuggestedCaseNotes = () => {
  initHighlighting()
  initSorting()
  initTruncation()
}
