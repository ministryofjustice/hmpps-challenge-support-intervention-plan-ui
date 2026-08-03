import SuggestedCaseNotesService, {
  SuggestedCaseNotesRequest,
  SuggestedCaseNotesResponse,
} from './suggestedCaseNotesService'
import requestFixture from './fixtures/csip-assist-request.json'
import responseFixture from './fixtures/csip-assist-response.json'

const typedRequestFixture = requestFixture as SuggestedCaseNotesRequest
const typedResponseFixture = responseFixture as SuggestedCaseNotesResponse

describe('SuggestedCaseNotesService', () => {
  it('returns sample response and overlays request fields', async () => {
    const service = new SuggestedCaseNotesService()

    const response = await service.getSuggestedCaseNotes({
      ...typedRequestFixture,
      referralId: 'different-referral-id',
      behaviourType: 'risks_and_triggers',
      sortOrder: 'asc',
    })

    expect(response).toMatchObject({
      ...responseFixture,
      referralId: 'different-referral-id',
      behaviourType: 'risks_and_triggers',
      sortField: 'relevance',
      sortOrder: 'asc',
    })
  })

  it('returns consistent suggested case notes data', async () => {
    const service = new SuggestedCaseNotesService()

    const response = await service.getSuggestedCaseNotes(typedRequestFixture)

    expect(response.suggestedCaseNotes).toEqual(typedResponseFixture.suggestedCaseNotes)
  })

  it('does not mutate cached base data when callers mutate a previous response', async () => {
    const service = new SuggestedCaseNotesService()

    const initialResponse = await service.getSuggestedCaseNotes(typedRequestFixture)
    initialResponse.suggestedCaseNotes[0]!.annotated_case_note = 'mutated note'

    const response = await service.getSuggestedCaseNotes({
      ...typedRequestFixture,
      referralId: 'another-referral-id',
    })

    expect(response.suggestedCaseNotes[0]!.annotated_case_note).toBe(
      typedResponseFixture.suggestedCaseNotes[0]!.annotated_case_note,
    )
  })
})
