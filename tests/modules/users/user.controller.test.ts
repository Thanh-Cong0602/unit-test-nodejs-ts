import type { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";

import { UserController } from "~/modules/users/user.controller";
import { UserService } from "~/modules/users/user.service";


// Mock toàn bộ UserService ở đây vì chúng ta sẽ không test logic ở file test controller.
jest.mock('~/modules/users/user.service', () => ({
  UserService: {
    register: jest.fn(),
    list: jest.fn()
  }
}))

describe('UserController', () => {
  // Tạo một func mock có nhiệm vụ trả về một cái Response chuẩn ExpressJS
  // Giả lập res.status().json() trong Express, bằng cách ép status và json trả về chính res để không bị lỗi method chaining

  const mockResponse = () => {
    const res = {} as unknown as Response
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  describe('register func', () => {
    it("Should call UserService.register and return 201 with user data", async () => {
      const req = {
        body: {
          email: 'tcn0602@gmail.com',
          username: 'thcongng',
          password: 'tcn0602C@'
        }
      } as unknown as Request

      const res = mockResponse()

      const fakeResponse = {
        _id: 'fake-user-id-01',
        email: 'tcn0602@gmail.com',
        username: 'thcongng',
      }

      // Mock UserService.register trả về fakeUser
      // defensive semicolon, dấu chấm phẩy đầu dòng thay vì cuối dòng trước đó, để tránh syntax error khi build code
      ;(UserService.register as jest.Mock).mockResolvedValue(fakeResponse)

      await UserController.register(req, res)

      // Test UserService.register đã gọi tới 3 tham số lần lượt chuẩn email, username, password hay chưa
      expect(UserService.register).toHaveBeenCalledWith(
        req.body.email, // 'tcn0602@gmail.com'
        req.body.username, // thcongng
        req.body.password // tcn0602C@
      )

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED)

      expect(res.json).toHaveBeenCalledWith(fakeResponse)
    })
  })

  describe('list func', () => {
    it('Should return list of users', async () => {
      const req = { } as unknown as Request
      const res = mockResponse()

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

      ;(UserService.list as jest.Mock).mockResolvedValue(fakeUsersResponse)

      await UserController.list(req, res)

      expect(UserService.list).toHaveBeenCalled()

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK)

      expect(res.json).toHaveBeenCalledWith(fakeUsersResponse)
     })
  })
})
