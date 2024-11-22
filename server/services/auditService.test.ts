import AuditService from './auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'

jest.mock('../data/hmppsAuditClient')

describe('Audit service', () => {
  let hmppsAuditClient: jest.Mocked<HmppsAuditClient>
  let auditService: AuditService

  beforeEach(() => {
    hmppsAuditClient = new HmppsAuditClient({
      enabled: false,
      queueUrl: '',
      region: '',
      serviceName: '',
    }) as jest.Mocked<HmppsAuditClient>
    auditService = new AuditService(hmppsAuditClient)
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'AUDIT_EVENT',
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
        '/csip-records/0192d2fb-6920-749f-86fb-f0c6c2deaec8',
        {},
        { extraDetails: 'example' },
        {
          pageNameSuffix: 'EXAMPLE_PAGE',
          who: 'user1',
          correlationId: 'request123',
        },
      )

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: '0192d2fb-6920-749f-86fb-f0c6c2deaec8',
        subjectType: '0192d2fb-6920-749f-86fb-f0c6c2deaec8',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })
})
