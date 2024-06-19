import { Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import setUpJourneyData from './setUpJourneyData'
import { JourneyData } from '../@types/express'

const middleware = setUpJourneyData()

let req: Request
let res: Response

let journeyId: string

const next = jest.fn()

beforeEach(() => {
  journeyId = uuidV4()

  res = {
    redirect: jest.fn(),
  } as unknown as Response

  req = {
    session: {},
    params: { journeyId },
  } as unknown as Request
})

describe('setUpJourneyData', () => {
  describe('create journey data map', () => {
    it('should create a new journey data map when map is undefined', async () => {
      req.session.journeyDataMap = undefined

      middleware(req, res, next)

      expect(req.session.journeyDataMap).not.toBeUndefined()
      expect(req.session.journeyDataMap).not.toBeNull()
    })

    it('should create a new journey data map when map is null', async () => {
      req.session.journeyDataMap = null

      middleware(req, res, next)

      expect(req.session.journeyDataMap).not.toBeUndefined()
      expect(req.session.journeyDataMap).not.toBeNull()
    })

    it('should not create a new journey data map when there is a map', async () => {
      req.session.journeyDataMap = new Map<string, JourneyData>()

      middleware(req, res, next)

      expect(req.session.journeyDataMap).not.toBeUndefined()
      expect(req.session.journeyDataMap).not.toBeNull()
    })
  })

  describe('get journey data', () => {
    it('should create a new journey data when map does not contain data for the journey id', async () => {
      req.session.journeyDataMap = new Map<string, JourneyData>()

      middleware(req, res, next)

      expect(req.journeyData).not.toBeUndefined()
      expect(req.journeyData).not.toBeNull()
    })

    it('should return existing journey data when journey data is found for the journey id', async () => {
      req.session.journeyDataMap = new Map<string, JourneyData>()
      const existingData: JourneyData = {
        instanceUnixEpoch: Date.now(),
        logNumber: 'log_number',
      }
      req.session.journeyDataMap.set(journeyId, existingData)

      middleware(req, res, next)

      expect(req.journeyData).toBe(existingData)
    })
  })

  describe('set journey data', () => {
    it('should set journey data to map using journey id and with unix timestamp', async () => {
      middleware(req, res, next)

      const journeyData = {
        instanceUnixEpoch: 0,
        logNumber: 'new_log',
      }
      req.journeyData = journeyData

      expect(req.session.journeyDataMap.get(journeyId).logNumber).toBe(journeyData.logNumber)
      expect(req.journeyData.logNumber).toBe(journeyData.logNumber)
      expect(req.journeyData.instanceUnixEpoch).toBeGreaterThan(journeyData.instanceUnixEpoch)
    })

    it('should unset journey data', async () => {
      req.session.journeyDataMap = new Map<string, JourneyData>()
      const existingData: JourneyData = {
        instanceUnixEpoch: Date.now(),
        logNumber: 'log_number',
      }
      req.session.journeyDataMap.set(journeyId, existingData)

      middleware(req, res, next)

      req.journeyData = null

      expect(req.session.journeyDataMap.get(journeyId)).toBeUndefined()
    })

    it('should clean up oldest journey data when max number is exceeded', async () => {
      const epoch = Date.now() - 100000 // Reduced by 100 seconds to avoid clash of epoch

      req.session.journeyDataMap = new Map<string, JourneyData>()

      Array.from(Array(100).keys()).forEach(idx => {
        req.session.journeyDataMap.set(uuidV4(), { instanceUnixEpoch: epoch + idx })
      })

      middleware(req, res, next)

      expect(req.session.journeyDataMap.get(journeyId)).toBeUndefined()

      req.journeyData = {
        instanceUnixEpoch: 0,
        logNumber: 'new_log',
      }

      expect(req.session.journeyDataMap.size).toEqual(100)
      expect(Array.from(req.session.journeyDataMap.values()).find(j => j.instanceUnixEpoch === epoch)).toBeUndefined()
    })
  })
})
