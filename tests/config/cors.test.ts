import expess from 'express'
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { corsMiddleware } from '~/config/cors'

describe('corsMiddleware', () => {
  // Đầu tiên chúng ta cần phải tạo một con Express App tối giản để test CORS
  const createTestApp = () => {
    const app = expess()
    app.use(corsMiddleware)
    app.get('/test-cors', (_req, res) => res.json({ ok: 'true' }))
    return app
  }

  it('Allow request when origin is in whitelist', async () => {
    const allowedDomain = 'http://localhost:5173'
    const app = createTestApp()

    const res = await request(app)
      .get('/test-cors')
      .set('Origin', allowedDomain)

    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body).toEqual({ ok: 'true' })
  })

  it('Blocks request when origin is not allowed', async () => {
    const notAllowedDomain = 'http://localhost:5176'
    const app = createTestApp()

    const res = await request(app)
      .get('/test-cors')
      .set('Origin', notAllowedDomain)

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(res.ok).toBe(false)
    expect(JSON.stringify(res.error)).toContain(`Error: Origin ${notAllowedDomain} not allowed by CORS`)
  })

  it('Allows request without origin (Postman, Curl)', async () => {
    const app = createTestApp()

    // Không set origin cho trường hợp này
    const res = await request(app).get('/test-cors')

    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body).toEqual({ ok: 'true' })
  })
})
