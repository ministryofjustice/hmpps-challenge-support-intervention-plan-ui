import { todayString } from '../../../utils/datetimeUtils'

type DatePriority = 'NORMAL' | 'URGENT' | 'OVERDUE'

export const datePriority = (date: string): DatePriority => {
  const dateString = new Date(Date.parse(date.split(/[-/]/).reverse().join('-'))).toISOString().substring(0, 10)
  if (dateString < todayString()) {
    return 'OVERDUE'
  }
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  if (dateString <= nextWeek.toISOString().substring(0, 10)) {
    return 'URGENT'
  }
  return 'NORMAL'
}

export const convertToSortableColumns = (headings: { text: string; key?: string }[], sort: string) => {
  const [sortingKey, sortingDirection] = sort.split(',')

  return headings.map(heading => {
    if (!heading.key) {
      return heading
    }
    if (heading.key === sortingKey) {
      if (sortingDirection === 'asc') {
        return {
          attributes: {
            'aria-sort': 'ascending',
          },
          html: `<a href="?sort=${heading.key},desc"><button>${heading.text}</button></a>`,
        }
      }
      if (sortingDirection === 'desc') {
        return {
          attributes: {
            'aria-sort': 'descending',
          },
          html: `<a href="?sort=${heading.key},asc"><button>${heading.text}</button></a>`,
        }
      }
    }
    return {
      attributes: {
        'aria-sort': 'none',
      },
      html: `<a href="?sort=${heading.key},asc"><button>${heading.text}</button></a>`,
    }
  })
}
