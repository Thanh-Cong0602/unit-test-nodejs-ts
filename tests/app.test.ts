import type { Express } from 'express';
import request from 'supertest'; // Giả lập HTTP client để test Express app

import { createApp } from '~/app';
import { ApiError } from '~/core/http/ApiError';

describe('createApp func', () => {
  let app: Express
  // Chạy trước mỗi test (it) trong describe để khởi tạo một app mới, đảm bảo các test được độc lập với nhau
  beforeEach(() => {
    app = createApp()
  })

  it('GET /health', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('Sets no-catch headers for responses', async () => {
    const res = await request(app).get('/health')
    // console.log('🚀 ~ res.headers:', res.headers)

    expect(res.headers['cache-control']).toContain('no-store')
    expect(res.headers['cache-control']).toContain('no-cache')
    expect(res.headers['cache-control']).toContain('must-revalidate')
    expect(res.headers['pragma']).toContain('no-cache')
    expect(res.headers['expires']).toContain('0')
  })

  it('app error', async () => {
    // Khởi tạo tạm một cái đầu api chỉ dùng trong phạm vi test này để throw error
    app.get('/throw-error', (_req, _res) => {
      throw ApiError.BadRequest()
    })

    const res = await request(app).get('/throw-error')

    expect(res.status).toBe(400)
    expect(res.statusCode).toBe(400)
    expect(res.ok).toBe(false)
  })
})
