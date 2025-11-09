const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const db = require('../db/db')
const Sucursal = require('./sucursal.model') 

const Usuario = db.define('Usuario', {
  UsuarioId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.STRING(50), allowNull: false },
  SucursalId: { type: DataTypes.INTEGER },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'usuario',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash && !usuario.password_hash.startsWith('$2b$')) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10)
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash') && !usuario.password_hash.startsWith('$2b$')) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10)
      }
    }
  }
})

// 💥 ESTA ES LA CLAVE
Usuario.belongsTo(Sucursal, { foreignKey: 'SucursalId', as: 'Sucursal' })

module.exports = Usuario
