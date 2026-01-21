/**
 * NOTE: Không bắt buộc viết test cho các route vì nó không có logic chính. Giá trị test tạo ra không cao.
 * Tuy nhiên mình vẫn sẽ hướng dẫn các bạn test đúng các chức năng của route:
 * - Route /register gắn đúng middleware
 * - Route /list gắn đúng controller
 */

// Tạo mock cho router.post và router.get
const post = jest.fn()
const get = jest.fn()

// Mock express.Router(): Khi user.route.ts gọi Router(), nó sẽ nhận object { post, get } thay vì code từ thư viện
jest.mock('express', () => ({
  Router: () => ({ post, get })
}))

/*
  Mock validationRequest, asyncHandler, UserController, RegisterSchema
  Mục đích chỉ để test xem chúng nó có tồn tại và được gọi đến hay không. Chứ không test logic của chúng nó ở đây.
*/
const validateRequest = jest.fn(() => 'validate')
jest.mock('~/core/validate/validateRequest', () => ({
  validateRequest,
}))

const asyncHandler = jest.fn(() => 'async')
jest.mock('~/core/asyncHandler', () => ({
  asyncHandler,
}))

const UserController = {
  register: 'register',
  list: 'list'
}
jest.mock('~/modules/users/user.controller', () => ({
  UserController,
}))

const RegisterSchema = 'RegisterSchema'
jest.mock('~/modules/users/user.validation', () => ({
  RegisterSchema,
}))

describe('User Routers', () => {
  // Chỉ test wiring xem mọi thứ được gắn đúng hay chưa, không test behavior của chúng
  it('wires user route', async () => {
    // Trigger đăng ký router
    await import('~/modules/users/user.routes')

    // Test xem đã gắn chuẩn route với các middleware hay chưa
    expect(post).toHaveBeenCalledWith('/register', 'validate', 'async')
    expect(get).toHaveBeenCalledWith('/list', 'async')

    // Test xem đúng validate được gắn vào route với RegisterSchema hay chưa
    expect(validateRequest).toHaveBeenCalledWith('RegisterSchema')

    // Test xem đúng controller được gắn vào route qua asyncHandler hay chưa
    expect(asyncHandler).toHaveBeenCalledWith(UserController.register)
    expect(asyncHandler).toHaveBeenCalledWith(UserController.list)
  })
})

