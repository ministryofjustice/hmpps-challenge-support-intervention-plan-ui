import { todayString } from '../../../utils/datetimeUtils'

type DatePriority = 'NORMAL' | 'URGENT' | 'OVERDUE'

// compute priority for date in d/m/yyyy format
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

// add aria-sort attributes to govukTable head row, so that moj-sortable-table css will be applied
export const convertToSortableColumns = (
  headings: { text: string; key?: string }[],
  sort: string,
  hrefTemplate: string,
) => {
  const [sortKey, direction] = sort.split(',')

  return headings.map(heading => {
    if (!heading.key) {
      return heading
    }
    const href = hrefTemplate.replace(
      '{sort}',
      `${heading.key},${direction === 'asc' && heading.key === sortKey ? 'desc' : 'asc'}`,
    )

    if (heading.key === sortKey) {
      return {
        attributes: {
          'aria-sort': direction === 'asc' ? 'ascending' : 'descending',
        },
        html: `<a href="${href}"><button tabindex="-1">${heading.text}<span aria-hidden="true"></span></button></a>`,
      }
    }
    return {
      attributes: {
        'aria-sort': 'none',
      },
      html: `<a href="${href}"><button tabindex="-1">${heading.text}<span aria-hidden="true"></span></button></a>`,
    }
  })
}
