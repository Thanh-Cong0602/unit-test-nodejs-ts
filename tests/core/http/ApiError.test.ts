import { StatusCodes } from "http-status-codes"

import { ApiError } from "~/core/http/ApiError"

describe('ApiError', () => {
  it('Constructor should set statusCode, message, detail', () => {
    const details = {
      field: 'email',
      reason: 'Invalid email error'
    }

    const error = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Invalid input email', details)

    expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    expect(error.message).toBe('Invalid input email')
    expect(error.details).toEqual(details)
  })

  it('Should be instance of ApiError', () => {
    const error = new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toBeInstanceOf(Error)
  })

  it('Should have Stack Trace', () => {
    const error = new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

    // console.log('🚀 ~ error:', error.stack)

    expect(typeof error.stack).toBe('string')
    expect(error.stack).toContain('ApiError')
  })

  it('Method BadRequest should return 400 with default message', () => {
    const error = ApiError.BadRequest()

    expect(error).toBeInstanceOf(ApiError)
    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
    expect(error.message).toBe('Bad Request')
    expect(error.details).toBeUndefined()
  })

  it('Method BadRequest should return 400 with custom message and details data', () => {
    const customMessage = 'Email is required'
    const details = { field: 'email', reasom: customMessage}
    const error = ApiError.BadRequest(customMessage, details)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
    expect(error.message).toBe(customMessage)
    expect(error.details).toEqual(details)
  })
})
