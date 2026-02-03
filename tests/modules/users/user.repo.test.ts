import { ObjectId } from "mongodb";

import { col } from "~/config/db";
import { UserRepo } from "~/modules/users/user.repo";
import { UserRole } from "~/modules/users/user.types";
import { objectIdToString } from "~/utils/objectIdToString";

// Mock config db + collections
jest.mock('~/config/db', () => (
  {
  col: {
    users: jest.fn()
  }
}
))


// Mock utils (objectIdToString)
jest.mock('~/utils/objectIdToString', () => ({
  objectIdToString: jest.fn()
}))

describe('UserRepo', () => {
  // Định nghĩa một cái valid MongoDB ObjectId dạng 24-hex string
  const validId = '507f1f77bcf86cd799439011'

  // Mock các methods
  const findOne = jest.fn()
  const insertOne = jest.fn()
  const find = jest.fn()
  const toArray = jest.fn()

  // Chạy một lần trước toàn bộ test trong describe này để mock collection users kèm methods
  beforeAll(() => {
    ;(col.users as jest.Mock).mockReturnValue({
      findOne,
      insertOne,
      find
    })
  })

  describe('findById()', () => {
    it('Should call findOne with valid objectId', async () => {
      const fakeUserResponse = {
         _id: validId,
        email: 'tcn0602@gmail.com',
      }
      findOne.mockResolvedValue(fakeUserResponse)

      const result = await UserRepo.findById(validId)

      expect(col.users).toHaveBeenCalled()
      expect(findOne).toHaveBeenCalledTimes(1)
      expect(findOne).toHaveBeenCalledWith({ _id: new ObjectId(validId)})

      // Kiểm tra _id là ObjectId. Vì findOne đang là mock jest.fn, nên cách lấy data để test sẽ thông qua mock.calls
      // console.log('findOne.mock.calls', findOne.mock.calls)
      /**
       * findOne.mock.calls: là mảng chứa tất cả các lần gọi của mock findOne.
       * findOne.mock.calls[0]: là lần gọi đầu tiên của findOne.
       * findOne.mock.calls[0][0]: là tham số đầu tiên được truyền vào trong lần gọi đầu tiên đó.
      */
      // console.log(findOne.mock.calls[0][0])
      const resId = findOne.mock.calls[0][0]
      expect(resId).toEqual({ _id: new ObjectId(validId) })
      expect(result).toBe(fakeUserResponse)
    })
  })

  describe('findByEmail()', () => {
    it('Should call findOne with email', async () => {
      const fakeUserResponse = {
         _id: validId,
        email: 'tcn0602@gmail.com',
      }
      findOne.mockResolvedValue(fakeUserResponse)

      const result = await UserRepo.findByEmail('tcn0602@gmail.com')

      expect(col.users).toHaveBeenCalled()
      expect(findOne).toHaveBeenCalledTimes(1)
      expect(findOne).toHaveBeenCalledWith({ email: 'tcn0602@gmail.com' })
      expect(result).toBe(fakeUserResponse)
    })
  })

  describe('create()', () => {
    it('Should add timestamps, insert and return _id as string', async () => {
      /**
       * Test case này phụ thuộc vào thời gian hệ thống (new Date()).
       * Vì vậy mỗi lần chạy test, kết quả có thể khác nhau.
       * Do đó chúng ta cần cố định (mock) thời gian hệ thống để đảm bảo tính ổn định của test.
      */

      // useFakeTimers() trong Jest giúp kiểm soát hoàn toàn thời gian trong test,
      // thay vì phụ thuộc vào thời gian thực của máy chạy test.
      jest.useFakeTimers()

      // Giả lập thời gian hệ thống là một thời điểm cố định cho dù sau này có gọi new Date() bao nhiêu lần đi nữa
      jest.setSystemTime(new Date('2026-02-03T17:12:59.416Z'))

      // Mock insertOne trả về insertedId là ObjectId
      const fakeInsertedId = new ObjectId('507f1f77bcf86cd799439011')
      insertOne.mockResolvedValue({ insertedId: fakeInsertedId })

      // Mock objectIdToString trả về string từ ObjectId
      ;(objectIdToString as jest.Mock).mockReturnValue('507f1f77bcf86cd799439011')

      const createUserPayload = {
        email: 'tcn0602@gmail.com',
        username: 'thcongng',
        password_hash: 'hashed-password-example',
        role: UserRole.USER,
      } as any

      // Gọi repo hàm create
      const result = await UserRepo.create(createUserPayload)

      // Test insertOne nhận doc có createdAt và updatedAt hay không?
      expect(insertOne).toHaveBeenCalledTimes(1)
      const insertedDoc = insertOne.mock.calls[0][0]
      expect(insertedDoc).toMatchObject({
        ...createUserPayload,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Test createdAt và updatedAt phải cùng thời điểm (vì dùng cùng now)
      expect(insertedDoc.createdAt.getTime()).toBe(insertedDoc.updatedAt.getTime())

      // objectIdToString phải được gọi để convert insertedId
      expect(objectIdToString).toHaveBeenCalledWith(fakeInsertedId)

      // return có _id là string
      expect(result).toMatchObject({
        ...insertedDoc,
        _id: '507f1f77bcf86cd799439011'
      })

      // Quan trọng: reset lại thời gian hệ thống về bình thường để không ảnh hưởng các test sau.
      jest.useRealTimers()
    })
  })

  describe('list', () => {
    it('Should return list of users from find().toArray()', async () => {
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

      // find() trả về cursor (đối tượng đại diện cho tập kết quả truy vấn) và có method toArray()
      find.mockReturnValue({ toArray })
      // toArray() trả về mảng kết quả
      toArray.mockResolvedValue(fakeUsersResponse)

      // Gọi repo hàm list
      const result = await UserRepo.list()

      expect(col.users).toHaveBeenCalled()
      expect(find).toHaveBeenCalledTimes(1)
      expect(toArray).toHaveBeenCalledTimes(1)
      expect(result).toBe(fakeUsersResponse)
    })
  })
})
