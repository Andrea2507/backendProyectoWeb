const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Sucursal = db.define('Sucursal', {
  SucursalId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  ciudad: { type: DataTypes.STRING(80), allowNull: false },
  direccion: { type: DataTypes.STRING(200), allowNull: false }
}, {
  tableName: 'sucursal',
  timestamps: false
})

module.exports = Sucursal
