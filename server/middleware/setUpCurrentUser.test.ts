import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import type { HmppsUser } from '../interfaces/hmppsUser'
import setUpCurrentUser from './setUpCurrentUser'

describe('setUpCurrentUser', () => {
  async function currentUserForToken(claims: Record<string, unknown>): Promise<HmppsUser> {
    let currentUser: HmppsUser | undefined
    const app = express()
    app.use((_req, res, next) => {
      res.locals.user = {
        token: jwt.sign({ user_name: 'USER1', name: 'JOHN SMITH', ...claims }, 'secret'),
        username: 'USER1',
        authSource: 'nomis',
      } as HmppsUser
      next()
    })
    app.use(setUpCurrentUser())
    app.get('/', (_req, res) => {
      currentUser = res.locals.user
      res.send('OK')
    })

    await request(app).get('/').expect(200)
    return currentUser!
  }

  it('takes the user id and UUID from the sign-in token', async () => {
    const user = await currentUserForToken({
      user_id: '231232',
      user_uuid: '11111111-1111-1111-1111-111111111111',
      authorities: ['ROLE_PRISON'],
    })

    expect(user).toEqual(
      expect.objectContaining({
        username: 'USER1',
        userId: '231232',
        userUuid: '11111111-1111-1111-1111-111111111111',
        staffId: 231232,
        displayName: 'John Smith',
        userRoles: ['PRISON'],
      }),
    )
  })

  it('leaves the user id and UUID unset when the token does not have them', async () => {
    const user = await currentUserForToken({})

    expect(user.userId).toBeUndefined()
    expect(user.userUuid).toBeUndefined()
  })
})
