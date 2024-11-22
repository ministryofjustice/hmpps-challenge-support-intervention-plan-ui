import { Request, Response } from 'express'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

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

  async logPageView(req: Request, res: Response, pagePrefix: string = '') {
    const { pageNameSuffix, ...auditEventProperties } = res.locals.auditEvent

    const csipFromUrl = req.originalUrl.includes('csip-record')
      ? req.originalUrl.split('/').filter(Boolean)[1]
      : undefined
    const csipIdInRequest = csipFromUrl || req.journeyData?.csipRecord?.recordUuid

    const event: AuditEvent = {
      ...auditEventProperties,
      ...(req.query ? { details: req.query } : {}),
      ...(csipIdInRequest ? { subjectId: csipIdInRequest } : {}),
      ...(csipIdInRequest ? { subjectType: csipIdInRequest } : {}),
      what: `PAGE_VIEW_${pagePrefix + pageNameSuffix}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
