// Jest sẽ hoist jest.mock() lên đầu file trước khi import bất kỳ module nào
jest.mock('mongodb', () => {
  // Trả về một Object class MongoClient thay thế cho package 'mongodb' thật
  return {
    MongoClient: jest.fn(() => ({
       connect: jest.fn().mockResolvedValue(undefined), // Không kết nối Database thật để tránh bị treo
        db: jest.fn(() => ({
          collection: jest.fn(() => ({ users: 'users,' }))
        })),
        close: jest.fn()
    }))
  }
})

describe('Database config', () => {
  const URI = 'mongodb+srv://username:password@cluster0-trungquandev.mongodb.net/database_name'
  beforeEach(() => {
    // Clear lịch sử call các cái mocks
    jest.clearAllMocks()
    // Reset module state (để reset biến db và client trong db.ts)
    jest.resetModules()
  })

  it('connectMongo() should connect only once', async () => {
    const { connectMongo } = await import('~/config/db')
    const { MongoClient } = await import('mongodb')

    // Gọi 2 lần func connectMongo()
    await connectMongo(URI)
    await connectMongo(URI)

    // Kiểm tra connectMongo() và expect nó chỉ gọi 1 lần
    expect(MongoClient).toHaveBeenCalledTimes(1)
  })

  it('Logs Connected to MongoDB when connectMongo() success', async () => {
    const { logger } = await import('~/config/logger')

    // Tạo mock func cho logger.info để tránh thay đổi logic thật. Và dùng jest.spyOn() để
    // theo dõi hàm logger.info (theo dõi số lần gọi hoặc tham số đầu vào)
    const mockLoggerInfoFn = jest.spyOn(logger, 'info')

    const { connectMongo } = await import('~/config/db')
    await connectMongo(URI)

    expect(mockLoggerInfoFn).toHaveBeenCalledTimes(1)
    expect(mockLoggerInfoFn).toHaveBeenCalledWith('Connected to MongoDB')
  })

  it('getDb() should throw error if MongoDB is not initialized', async () => {
    const { getDb } = await import('~/config/db')

    // Nếu không connect mà gọi luôn getDb thì expect error, message tương đồng với bên file db.ts
    expect(() => getDb()).toThrow('MongoDB is not initialized')
  })

  it('col.users() should return users collection', async () => {
    const { connectMongo, col} = await import('~/config/db')

    await connectMongo(URI)

    const userCollection = col.users()
    // Collection có tồn tại sau khi connect database thành công
    expect(userCollection).toBeDefined()
  })
})
