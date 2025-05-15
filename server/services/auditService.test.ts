import AuditService from './auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import { PrisonerSummary } from '../@types/express'

jest.mock('../data/hmppsAuditClient')

describe('Audit service', () => {
  let hmppsAuditClient: jest.Mocked<HmppsAuditClient>
  let auditService: AuditService

  beforeEach(() => {
    hmppsAuditClient = new HmppsAuditClient({
      queueUrl: '',
      region: '',
      serviceName: '',
    }) as jest.Mocked<HmppsAuditClient>
    auditService = new AuditService(hmppsAuditClient)
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        what: 'PAGE_VIEW',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'PAGE_VIEW',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logPageView', () => {
    it('sends page view event audit message using audit client', async () => {
      await auditService.logPageView(
        {
          prisoner: { prisonerNumber: '0192d2fb-6920-749f-86fb-f0c6c2deaec8' } as PrisonerSummary,
        },
        { extraDetails: 'example' },
        {
          who: 'user1',
          correlationId: 'request123',
        },
      )

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'PAGE_VIEW',
        who: 'user1',
        subjectId: '0192d2fb-6920-749f-86fb-f0c6c2deaec8',
        subjectType: 'PRISONER_ID',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })
})
