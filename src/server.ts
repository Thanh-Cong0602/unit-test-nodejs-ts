import { createApp } from '~/app'
import { env } from '~/config/env'
import { logger } from '~/config/logger'
// import { connectMongo } from './config/db'

(async () => {
  // LƯU Ý: Thực tế sẽ cần mở được connection và khởi tạo DB trước khi create express app
  // await connectMongo(env.MONGO_URI)

  const app = createApp()
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`)
  })
})().catch((e) => {

  console.error(e)
  process.exit(1)
})
