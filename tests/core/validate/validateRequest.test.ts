import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ApiError } from '~/core/http/ApiError'
import { validateRequest, ZodEmptyObject } from '~/core/validate/validateRequest'

describe('validateRequest func', () => {
  it('Valid request (success) > call next function', () => {
    // Tạo Schema
    const schema = z.object({
      body: z.object({
        email: z.email(),
      }),
      query: ZodEmptyObject,
      params: ZodEmptyObject,
    })

    // Tạo req data để test
    const req = {
      body: { email: 'tcn@gmail.com'},
      query: {},
      params: {}
    } as unknown as Request

    // Không dùng gì đến res nên mock data rỗng, còn next() là mock function
    const res = {} as unknown as Response
    const next = jest.fn() as unknown as NextFunction

    // Tạo middleware từ schema
    const validateRequestMiddleware = validateRequest(schema)

    // Tạo hàm gọi middleware trên với req, res, next
    const callMiddleware = () => {
      validateRequestMiddleware(req, res, next)
    }

    // Kiểm tra không bị lỗi > Nghĩa là không throw error
    expect(callMiddleware).not.toThrow()
    // Kiểm tra xem thằng next() function có được gọi đúng 1 lần hay không
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('Invalid request (fail) > throw ApiError.BadRequest with message && details data', () => {
    // Tạo Schema
    const schema = z.object({
      body: z.object({
        email: z.email(),
        profile: z.object({
          age: z.number().int().min(18),
        })
      }),
      query: z.object({
        page: z.coerce.number().int().min(1), // coerce: ép kiểu dữ liệu đầu vào thành number trước khi validate dữ liệu
      }),
      params: z.object({
        userId: z.string().min(1),
      }),
    })

    const req = {
      body: {
        email: 'tcn---', // Wrong email format
        profile: {
          age: '17', // Age should be min 18
        },
      },
      query: {
        page: '0' // coerce > number 0 > fails because min(1)
      },
      params: {
        userId: '' // fails because min 1 character
      }
    } as unknown as Request

    const res = {} as unknown as Response
    const next = jest.fn() as unknown as NextFunction
    try {
      // Call luôn cái middleware validateRequest ở đây
      validateRequest(schema)(req, res, next)

      // Trong trường hợp này chúng ta đang mong đợi có lỗi, nên nếu như code chạy success trong cái thân try thì test sẽ fail,
      // mục đích cần nó chạy vào catch block bên dưới
      throw new Error('Should throw error to catch block!')
    } catch (error: any) {
      // Check xem có đúng instance của ApiError và đúng statusCode hay không
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)

      // Check xem message có chứa danh sách path hay không
      // console.log(error.message)
      // Validation error: body.email, body.profile.age, query.page, params.userId
      expect(error.message).toContain('Validation error:')
      expect(error.message).toContain('body.email')
      expect(error.message).toContain('body.profile.age')
      expect(error.message).toContain('query.page')
      expect(error.message).toContain('params.userId')

      // Check xem cái mảng details data đã được map chuẩn hay chưa { path, message }
      // console.log(error.details)
      expect(error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'body.email', message: expect.any(String)}),
          expect.objectContaining({ path: 'body.profile.age', message: expect.any(String)}),
          expect.objectContaining({ path: 'query.page', message: expect.any(String)}),
          expect.objectContaining({ path: 'params.userId', message: expect.any(String)}),
        ])
      )

      // Trong cái test case mong đợi invalid thì không được gọi next()
      expect(next).not.toHaveBeenCalled()
    }
  })
})
