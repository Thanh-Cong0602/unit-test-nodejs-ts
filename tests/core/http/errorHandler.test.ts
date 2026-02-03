import { NextFunction, Request, Response } from 'express'

import { ApiError } from '~/core/http/ApiError'
import { errorHandler } from '~/core/http/errorHandler'


describe('errorHandler func', () => {
  it('Case: ApiError > return statusCode, message, details', async () => {
    // Mock data & function
    const req = {} as Request

    // as unknown as something: Kỹ thuật ép kiểu an toàn trong TS: double assertion
    const next = jest.fn() as unknown as NextFunction

    // Mock Response của Express
    const res = {
      status: jest.fn().mockReturnThis(), // mockReturnThis() cho phép chainable - gọi nối tiếp kiểu res
      json: jest.fn()
    } as unknown as Response

    // Tạo một cái instance ApiError với status là 400 (Bad Request)
    const error = ApiError.BadRequest('Invalid input', { field: 'email'})

    // Gọi errorHandler middleware
    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid input',
      details: { field: 'email' }
    })
  })

  it('Case: Unhandler Error > return statusCode 500 Internal Server Error ', async () => {
    // Mock data & function
    const req = {} as Request

     const res = {
      status: jest.fn().mockReturnThis(), // mockReturnThis() cho phép chainable - gọi nối tiếp kiểu res
      json: jest.fn()
    } as unknown as Response

    // as unknown as something: Kỹ thuật ép kiểu an toàn trong TS: double assertion
    const next = jest.fn() as unknown as NextFunction

    // Tạo một cái Error thuần từ Error của JavaScript
    const error = new Error('Something went wrong !!!')

    // Gọi errorHandler middleware
    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    })
  })
})
