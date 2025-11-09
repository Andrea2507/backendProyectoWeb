import app from './app.js'
import sequelize from './database.js'

const PORT = process.env.PORT || 3000

const start = async () => {
  await sequelize.authenticate()
  await sequelize.sync()
  app.listen(PORT, () => {})
}
start()
