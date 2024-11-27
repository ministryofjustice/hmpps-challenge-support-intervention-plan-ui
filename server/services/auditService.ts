import { Request, Response } from 'express'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'
import { JourneyData } from '../@types/express'
import { components } from '../@types/csip'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logModificationApiCall(
    auditType: 'ATTEMPT' | 'SUCCESS',
    modificationType: 'CREATE' | 'UPDATE',
    entity: components['schemas']['ResponseMapping']['component'],
    requestUrl: string,
    journeyData: Partial<JourneyData>,
    auditEvent: Response['locals']['auditEvent'],
  ) {
    const csipFromUrl = requestUrl.includes('csip-record') ? requestUrl.split('/').filter(Boolean)[1] : undefined
    const csipIdInRequest = csipFromUrl || journeyData?.csipRecord?.recordUuid

    const pageName = requestUrl.replace(/\?.*/, '').split('/').slice(2).join('/').replace('/', '_').replace('-', '_')
    const event: AuditEvent = {
      ...auditEvent,
      what: `${auditType}_${modificationType}_${entity}_${pageName}`,
      ...(csipIdInRequest ? { subjectId: csipIdInRequest } : {}),
      ...(csipIdInRequest ? { subjectType: csipIdInRequest } : {}),
    }
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(
    requestUrl: string,
    journeyData: Partial<JourneyData>,
    query: Request['query'],
    auditEvent: Response['locals']['auditEvent'],
    pagePrefix: string = '',
  ) {
    const { pageNameSuffix, ...auditEventProperties } = auditEvent

    const csipFromUrl = requestUrl.includes('csip-record') ? requestUrl.split('/').filter(Boolean)[1] : undefined
    const csipIdInRequest = csipFromUrl || journeyData?.csipRecord?.recordUuid

    const event: AuditEvent = {
      ...auditEventProperties,
      ...(query ? { details: query } : {}),
      ...(csipIdInRequest ? { subjectId: csipIdInRequest } : {}),
      ...(csipIdInRequest ? { subjectType: csipIdInRequest } : {}),
      what: `PAGE_VIEW_${pagePrefix + pageNameSuffix}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
