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
    let event: AuditEvent = {
      ...auditEvent,
      what: `API_CALL_${auditType}`,
      details: {
        ...auditEvent.details,
        apiUrl: `${httpMethod} ${requestUrl}`,
      },
    }

    if (event.subjectType !== 'PRISONER_ID' || !event.subjectId) {
      event = {
        ...event,
        ...this.getSubject(journeyData?.prisoner?.prisonerNumber),
      }
    }

    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(
    journeyData: Partial<JourneyData>,
    query: Request['query'],
    auditEvent: Response['locals']['auditEvent'],
    isAttempt: boolean = false,
  ) {
    let event: AuditEvent = {
      ...auditEvent,
      ...(query ? { details: query } : {}),
      what: isAttempt ? 'PAGE_VIEW_ACCESS_ATTEMPT' : 'PAGE_VIEW',
    }

    if (event.subjectType !== 'PRISONER_ID' || !event.subjectId) {
      const prisonNumber = journeyData?.prisoner?.prisonerNumber
      const searchTerm = query?.['query']

      event = {
        ...event,
        ...this.getSubject(prisonNumber, searchTerm as string),
      }
    }
    await this.hmppsAuditClient.sendMessage(event)
  }

  private getSubject(prisonNumber?: string, searchTerm?: string) {
    if (prisonNumber) {
      return { subjectId: prisonNumber, subjectType: 'PRISONER_ID' }
    }
    if (searchTerm) {
      return { subjectId: searchTerm as string, subjectType: 'SEARCH_TERM' }
    }
    return { subjectType: 'NOT_APPLICABLE' }
  }
}
