import { Request } from 'express'
import { schemaFactory } from './schemas'
import CsipApiService from '../../../../services/csipApi/csipApiService'

const mockCsipApiService = {
  getReferenceData: jest.fn(),
} as unknown as jest.Mocked<CsipApiService>

const mockRequest = {
  journeyData: {
    referral: {
      isProactiveReferral: false,
    },
  },
} as Request

describe('Details Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCsipApiService.getReferenceData.mockResolvedValue([
      { code: 'LOC1', description: 'Location 1' },
      { code: 'TYPE1', description: 'Type 1' },
    ])
  })

  describe('time validation edge cases', () => {
    it('should handle invalid hour with valid minute', async () => {
      const schema = await schemaFactory(mockCsipApiService)(mockRequest)

      const result = await schema.safeParseAsync({
        incidentDate: '01/01/2024', // Valid date format
        hour: '25', // Invalid hour
        minute: '30', // Valid minute
        incidentLocation: 'LOC1',
        incidentType: 'TYPE1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const timeError = result.error.issues.find(issue => issue.path.includes('incidentTime-hour'))
        expect(timeError).toBeDefined()
        expect(timeError?.message).toBe('Enter a time using the 24-hour clock')
      }
    })

    it('should handle valid hour with invalid minute', async () => {
      const schema = await schemaFactory(mockCsipApiService)(mockRequest)

      const result = await schema.safeParseAsync({
        incidentDate: '01/01/2024', // Valid date format
        hour: '10', // Valid hour
        minute: '70', // Invalid minute
        incidentLocation: 'LOC1',
        incidentType: 'TYPE1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const timeError = result.error.issues.find(issue => issue.path.includes('incidentTime-hour'))
        expect(timeError).toBeDefined()
        expect(timeError?.message).toBe('Enter a time using the 24-hour clock')
      }
    })

    it('should handle incomplete time - hour only', async () => {
      const schema = await schemaFactory(mockCsipApiService)(mockRequest)

      const result = await schema.safeParseAsync({
        incidentDate: '01/01/2024', // Valid date format
        hour: '10', // Hour provided
        minute: '', // Minute missing
        incidentLocation: 'LOC1',
        incidentType: 'TYPE1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const timeError = result.error.issues.find(issue => issue.path.includes('incidentTime-hour'))
        expect(timeError).toBeDefined()
        expect(timeError?.message).toBe('Enter a time using the 24-hour clock')
      }
    })

    it('should handle incomplete time - minute only', async () => {
      const schema = await schemaFactory(mockCsipApiService)(mockRequest)

      const result = await schema.safeParseAsync({
        incidentDate: '01/01/2024', // Valid date format
        hour: '', // Hour missing
        minute: '30', // Minute provided
        incidentLocation: 'LOC1',
        incidentType: 'TYPE1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const timeError = result.error.issues.find(issue => issue.path.includes('incidentTime-hour'))
        expect(timeError).toBeDefined()
        expect(timeError?.message).toBe('Enter a time using the 24-hour clock')
      }
    })
  })
})
