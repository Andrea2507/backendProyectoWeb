import bcrypt from 'bcryptjs'
import sequelize from '../db.js'
import Usuario from '../models/usuario.model.js'

const run = async () => {
  await sequelize.authenticate()
  await sequelize.sync()
  const correo = 'admin@storeonline.com'
  const exists = await Usuario.findOne({ where: { correo } })
  if (!exists) {
    const hashed = await bcrypt.hash('Admin123*', 10)
    await Usuario.create({ nombre: 'Admin', correo, password: hashed, rol: 'GERENTE', sucursalId: null })
  }
  process.exit(0)
}
run()
