import nock from 'nock'

import config from '../../config'
import CsipApiClient from './csipApiClient'
import type { SuggestedCaseNotesRequest, SuggestedCaseNotesResponse } from '../suggestedCaseNotes/types'

describe('CsipApiClient', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('posts suggested case notes request to backend endpoint', async () => {
    const client = new CsipApiClient('token-1')

    const request: SuggestedCaseNotesRequest = {
      referralId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      behaviourType: 'usual_behaviour_presentation',
      sortField: 'relevance',
      sortOrder: 'desc',
    }

    const response: SuggestedCaseNotesResponse = {
      prisonerId: 'A1234AA',
      referralId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      behaviourType: 'usual_behaviour_presentation',
      sortField: 'relevance',
      sortOrder: 'desc',
      suggestedCaseNotes: [
        {
          relevance: 'high',
          case_note_id: 'f4ee95d0-49a4-46a2-a485-b8f26f089170',
          annotated_case_note: 'Example',
        },
      ],
    }

    nock(config.apis.csipApi.url, {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      .post('/v1/suggestedCaseNotes/A1234AA', request)
      .reply(200, response)

    const result = await client.getSuggestedCaseNotes('A1234AA', request)

    expect(result).toEqual(response)
    expect(nock.isDone()).toBe(true)
  })
})
