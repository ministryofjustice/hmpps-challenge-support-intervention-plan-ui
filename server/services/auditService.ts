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
      action: `API_CALL_${auditType}`,
      ...this.getSubject(journeyData?.prisoner?.prisonerNumber),
      details: {
        ...auditEvent.details,
        apiUrl: `${httpMethod} ${requestUrl}`,
      },
    }
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(
    journeyData: Partial<JourneyData>,
    query: Request['query'],
    auditEvent: Response['locals']['auditEvent'],
    isAttempt: boolean = false,
  ) {
    const prisonNumber = journeyData?.prisoner?.prisonerNumber
    const searchTerm = query?.['query']

    const event: AuditEvent = {
      ...auditEvent,
      ...(query ? { details: query } : {}),
      ...this.getSubject(prisonNumber, searchTerm as string),
      action: isAttempt ? 'PAGE_VIEW_ACCESS_ATTEMPT' : 'PAGE_VIEW',
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
