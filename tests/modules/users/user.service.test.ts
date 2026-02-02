import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'

import { UserService } from '~/modules/users/user.service'
import { UserRepo } from '~/modules/users/user.repo'
import { UserRole } from '~/modules/users/user.types'

// Mock thư viện bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}))

jest.mock('~/modules/users/user.repo', () => ({
  UserRepo: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  }
}))

describe('UserService', () => {
  describe('register', () => {
    it('Should throw error 409 (conflict) if Email already exists', async () => {
      // Mock UserRepo.findByEmail: mô phỏng kết quả của UserRepo.findByEmail trả về sẵn một user cụ thể
      const fakeUserResponse = {
         _id: 'fake-user-id-01',
        email: 'tcn0602@gmail.com',
        username: 'thcongng',
      }
      ;(UserRepo.findByEmail as jest.Mock).mockResolvedValue(fakeUserResponse)

      // Khi chạy UserService.register, nó sẽ gọi UserRepo.findByEmail với email được truyền vào, và sẽ rơi vào case tồn tại user rồi
      const promise = UserService.register(
        'tcn0602@gmail.com',
        'thcongng',
        'tcn0602C@'
      )

      // promise.catch((err) => {
      // console.log('🚀 ~ err:', err)
      // })

      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.CONFLICT,
        message: 'Email already exists'
      })
      expect(UserRepo.findByEmail).toHaveBeenCalledTimes(1)
      expect(UserRepo.findByEmail).toHaveBeenCalledWith('tcn0602@gmail.com')
      expect(bcryptjs.hash).not.toHaveBeenCalled()
      expect(UserRepo.create).not.toHaveBeenCalled()
    })

    it('Should hash password and create user with role USER', async () => {
      ;(UserRepo.findByEmail as jest.Mock).mockResolvedValue(null)

      const hashedPassword = 'hashed-password-example'
      ;(bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword)

      const createdUserResponse = {
        _id: 'fake-user-id-01',
        email: 'tcn0602@gmail.com',
        username: 'thcongng',
        password_hash: hashedPassword,
        role: UserRole.USER,
      }
      ;(UserRepo.create as jest.Mock).mockResolvedValue(createdUserResponse)

      const createUserPayload = {
        email: 'tcn0602@gmail.com',
        username: 'thcongng',
        password: 'tcn0602C@',
      }

      const result = await UserService.register(
        createUserPayload.email,
        createUserPayload.username,
        createUserPayload.password
      )

      expect(UserRepo.findByEmail).toHaveBeenCalledWith(createUserPayload.email)
      expect(bcryptjs.hash).toHaveBeenCalledWith(createUserPayload.password, 10)
      expect(UserRepo.create).toHaveBeenCalledWith({
        email: createUserPayload.email,
        username: createUserPayload.username,
        password_hash: hashedPassword,
        role: UserRole.USER,
      })
      expect(result).toBe(createdUserResponse)
    })
  })

  describe('list()', () => {
    it('Should return list of users', async () => {
      const fakeUsersResponse = [
        {
          _id: 'fake-user-id-01',
          email: 'tcn0602@gmail.com',
          username: 'thcongng',
        },
        {
          _id: 'fake-user-id-02',
          email: 'tcn060202@gmail.com',
          username: 'thanhcongnguyen',
        }
      ]

      ;(UserRepo.list as jest.Mock).mockResolvedValue(fakeUsersResponse)

      const result = await UserService.list()

      expect(UserRepo.list).toHaveBeenCalled()
      expect(result).toBe(fakeUsersResponse)
    })
  })
})
