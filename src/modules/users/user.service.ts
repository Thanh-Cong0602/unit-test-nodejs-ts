import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'

import { ApiError } from '~/core/http/ApiError'
import { UserRepo } from '~/modules/users/user.repo'
import { UserRole } from '~/modules/users/user.types'

export const UserService = {
  async register(email: string, username: string, password: string) {
    const existed = await UserRepo.findByEmail(email)
    if (existed) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    const passwordHash = await bcryptjs.hash(password, 10)
    return UserRepo.create({
      email,
      username,
      password_hash: passwordHash,
      role: UserRole.USER
    })
  },
  async list() {
    return UserRepo.list()
  },
}
