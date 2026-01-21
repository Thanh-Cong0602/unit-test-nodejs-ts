import { RegisterSchema } from "~/modules/users/user.validation"

describe('User Validation > RegisterSchema', () => {
  /*
  * Viết một cái helper func để tạo input cho Schema
  */
  const makeInput = (data?: Partial<any>) => ({
    body: {
      email: 'tcn@gmail.com',
      username: 'tcn',
      password: 'tcn0602C@',
      ...data?.body
    },
    query: {},
    params: {},
  })

  it('Should pass validation when body is valid', () => {
    const result = RegisterSchema.safeParse(makeInput())

    expect(result.success).toBe(true)
  })

  it('Should fail validation when body is invalid', () => {
    const result = RegisterSchema.safeParse(makeInput({
      body: { email: 'not-an-email' }
    }))

    expect(result.success).toBe(false)
  })

  it('Should fail validation when password is too short', () => {
    const result = RegisterSchema.safeParse(makeInput({
      body: { password: '123456' }
    }))

    expect(result.success).toBe(false)
  })

  it('Should faild validation when body is missing', () => {
    const result = RegisterSchema.safeParse({
      query: {},
      params: {},
    })

    expect(result.success).toBe(false)
  })
})
