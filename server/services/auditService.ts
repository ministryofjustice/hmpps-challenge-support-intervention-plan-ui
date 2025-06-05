import { Request, Response } from 'express'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'
import { JourneyData } from '../@types/express'
import { components } from '../@types/csip'

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logModificationApiCall(
    auditType: 'ATTEMPT' | 'SUCCESS',
    httpMethod: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    _entity: components['schemas']['ResponseMapping']['component'],
    requestUrl: string,
    journeyData: Partial<JourneyData>,
    auditEvent: Response['locals']['auditEvent'],
  ) {
    const event: AuditEvent = {
      ...auditEvent,
      what: `API_CALL_${auditType}`,
      details: {
        ...auditEvent.details,
        apiUrl: `${httpMethod} ${requestUrl}`,
      },
    }

    await this.hmppsAuditClient.sendMessage(this.processEvent(event, journeyData?.prisoner?.prisonerNumber))
  }

  async logPageView(
    journeyData: Partial<JourneyData>,
    query: Request['query'],
    auditEvent: Response['locals']['auditEvent'],
    isAttempt: boolean = false,
  ) {
    const event: AuditEvent = {
      ...auditEvent,
      details: {
        ...auditEvent.details,
        ...query,
      },
      what: isAttempt ? 'PAGE_VIEW_ACCESS_ATTEMPT' : 'PAGE_VIEW',
    }

    const prisonNumber = journeyData?.prisoner?.prisonerNumber
    const searchTerm = query?.['query']

    await this.hmppsAuditClient.sendMessage(this.processEvent(event, prisonNumber, searchTerm as string))
  }

  private processEvent(event: AuditEvent, prisonNumber?: string, searchTerm?: string) {
    const result = this.populateSubjectIntoEvent(event, prisonNumber, searchTerm)
    if (result.subjectId && result.subjectId.length > 80) {
      return {
        ...result,
        subjectId: result.subjectId.substring(0, 80),
      }
    }
    return result
  }

  private populateSubjectIntoEvent(event: AuditEvent, prisonNumber?: string, searchTerm?: string) {
    if (event.subjectType === 'PRISONER_ID' && event.subjectId) {
      return event
    }
    if (prisonNumber) {
      return { ...event, subjectId: prisonNumber, subjectType: 'PRISONER_ID' }
    }
    if (searchTerm) {
      return { ...event, subjectId: searchTerm as string, subjectType: 'SEARCH_TERM' }
    }
    return { ...event, subjectType: 'NOT_APPLICABLE' }
  }
}
