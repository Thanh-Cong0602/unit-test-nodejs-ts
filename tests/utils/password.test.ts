import { hashPassword, verifyPassword } from "~/utils/password"

describe('Password utils', () => {
  it('hashPassword func should return a hash string password', async () => {
    // Tạo một cái hash password từ plain password
    const hash = await hashPassword('tcn0602C@')

    // Kiểm tra bcrypt hash string luôn phải khác với plain password string
    expect(hash).not.toBe('tcn0602C@')

    // Bcrypt hash string sẽ thường bắt đầu chuỗi bằng $2a$, $2b$ hoặc $2y$
    expect(hash).toMatch(/^\$2[aby]\$/)
  })

  it('verifyPassword func should return true if correct password', async () => {
    const plainPassword = 'tcn0602C@'
    const hash = await hashPassword(plainPassword)
    const isValid = await verifyPassword(plainPassword, hash)

    expect(isValid).toBe(true)
  })

  it('verifyPassword func should return false if wrong password', async () => {
    const hash = await hashPassword('tcn0602C@')
    const isValid = await verifyPassword('123456', hash)

    expect(isValid).toBe(false)
  })
})
