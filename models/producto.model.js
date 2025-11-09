const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Producto = db.define('Producto', {
  ProductoId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sku: { type: DataTypes.STRING(40), allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.STRING(500) },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  marca: { type: DataTypes.STRING(80) },
  CategoriaId: { type: DataTypes.INTEGER },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'Producto', timestamps: false })

module.exports = Producto
