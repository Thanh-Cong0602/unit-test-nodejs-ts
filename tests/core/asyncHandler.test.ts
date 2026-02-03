import type { NextFunction, Request, Response } from 'express'

import { asyncHandler } from '~/core/asyncHandler'


describe('asyncHandler func ', () => {
  it('Call next(error) when handler throws an error', async () => {
    // Mock data & function
    const req = {} as Request
    const res = {} as Response
    // as unknown as something: Kỹ thuật ép kiểu an toàn trong TS: double assertion
    const next = jest.fn() as unknown as NextFunction

    // Tạo error
    const error = new Error('Something went wrong')

    // Mock hander function
    const handlerFunc = async () => {
      throw error // Mục đích để chạy vào Promise.reject(error)
    }

    // Gọi middleware asyncHandler
    const middleware = asyncHandler(handlerFunc as any)
    await middleware(req, res, next)

    // await asyncHandler(handlerFunc as any)(req, res, next)

    // Kiểm tra xem next(error) có được gọi với tham số là error hay không
    expect(next).toHaveBeenCalledWith(error)
  })

  it('Does not thing when handler resolves', async () => {
    const req = {} as Request
    const res = {} as Response
    const next = jest.fn() as unknown as NextFunction

    const handlerFunc = async () => {
      return 'TCN checkk' // Mục đích để chạy vào Promise.resolve('TCN checkk')
    }

    // Gọi middleware asyncHandler
    await asyncHandler(handlerFunc as any)(req, res, next)

    // Không lỗi -> Sẽ không gọi next(error)
    expect(next).not.toHaveBeenCalled()
  })
})
