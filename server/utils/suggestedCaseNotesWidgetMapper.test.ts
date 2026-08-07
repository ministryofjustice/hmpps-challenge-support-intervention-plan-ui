import { buildSuggestedCaseNotesWidgetModel } from './suggestedCaseNotesWidgetMapper'
import type { SuggestedCaseNotesResponse } from '../services/suggestedCaseNotes/suggestedCaseNotesService'
import responseFixture from '../services/suggestedCaseNotes/fixtures/csip-assist-response.json'

const typedResponseFixture = responseFixture as SuggestedCaseNotesResponse

const buildResponse = (): SuggestedCaseNotesResponse => structuredClone(typedResponseFixture)

describe('buildSuggestedCaseNotesWidgetModel', () => {
  it('sorts notes by relevance from high to low', () => {
    const response = buildResponse()
    response.suggestedCaseNotes = [
      response.suggestedCaseNotes[2]!,
      response.suggestedCaseNotes[0]!,
      response.suggestedCaseNotes[1]!,
    ]

    const result = buildSuggestedCaseNotesWidgetModel({ response })

    expect(result.notes.map(note => note.relevanceLabel)).toEqual(['High', 'Medium', 'Low'])
  })

  it('builds plain and highlighted fragments and strips supported markup from text', () => {
    const response = buildResponse()
    response.suggestedCaseNotes = [
      {
        relevance: 'high',
        case_note_id: '1',
        annotated_case_note: 'Before <mark><strong>highlighted section</strong></mark> after',
      },
    ]

    const result = buildSuggestedCaseNotesWidgetModel({ response })

    expect(result.notes[0]).toMatchObject({
      caseNoteText: 'Before highlighted section after',
      textFragments: [
        { text: 'Before ', highlighted: false },
        { text: 'highlighted section', highlighted: true },
        { text: ' after', highlighted: false },
      ],
    })
  })

  it('falls back to one plain fragment when no mark tags are present', () => {
    const response = buildResponse()
    response.suggestedCaseNotes = [
      {
        relevance: 'low',
        case_note_id: '2',
        annotated_case_note: 'No highlights available for this note.',
      },
    ]

    const result = buildSuggestedCaseNotesWidgetModel({ response, showHighlighting: false })

    expect(result.showHighlighting).toBe(false)
    expect(result.notes[0]!.textFragments).toEqual([
      { text: 'No highlights available for this note.', highlighted: false },
    ])
  })

  it('builds highlighted fragments from supported span annotation markers', () => {
    const response = buildResponse()
    response.suggestedCaseNotes = [
      {
        relevance: 'medium',
        case_note_id: '3',
        annotated_case_note: 'Prefix <span data="1"><strong>highlight</strong></span> suffix',
      },
    ]

    const result = buildSuggestedCaseNotesWidgetModel({ response })

    expect(result.notes[0]).toMatchObject({
      caseNoteText: 'Prefix highlight suffix',
      textFragments: [
        { text: 'Prefix ', highlighted: false },
        { text: 'highlight', highlighted: true },
        { text: ' suffix', highlighted: false },
      ],
    })
  })

  it('suppresses notes when sensitive content is present and the user lacks permission', () => {
    const response = buildResponse()
    response.hasSensitiveNotes = true
    response.userCanViewSensitiveNotes = false
    response.suggestedCaseNotes = [
      {
        relevance: 'high',
        case_note_id: '4',
        annotated_case_note: 'Sensitive note',
        is_sensitive: true,
      },
    ]

    const result = buildSuggestedCaseNotesWidgetModel({ response })

    expect(result.notes).toEqual([])
    expect(result.emptyStateMessage).toBe(
      'Suggested Case Notes cannot be shown because you do not have permission to view sensitive notes.',
    )
  })
})
