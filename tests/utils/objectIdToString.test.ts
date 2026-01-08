
import { ObjectId } from "mongodb"

import { objectIdToString } from "~/utils/objectIdToString"

// Jest runtime đã cung cấp describe, it, expect dưới dạng global
// functions rồi nên có thể dùng luôn describe, it, expect...vv nhé
/**
 * describe: gom các test case liên quan lại với nhau
 * it: Tạo một test case đơn lẻ
 * expect: Kiểm tra kết quả có đúng như mong đợi hay không.
 */

describe('objectIdToString', () => {
  it('Should return correct 24-chars hex string from MongoDB ObjectId', () => {
    const rawId = new ObjectId()
    const convertedId = objectIdToString(rawId)

    // toHexString() cua MongoDB > chuỗi hex 24 ký tự chuẩn.
    expect(convertedId).toBe(rawId.toHexString())

    // Phải có 24 ký tự.
    expect(convertedId).toHaveLength(24)

    // Kết quả id của mongodb phải là chuỗi chuẩn chữ cái thường và chữ số.
    expect(convertedId).toMatch(/^[a-f0-9]{24}$/)
   })
})
