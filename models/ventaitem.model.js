const { DataTypes } = require('sequelize')
const db = require('../db/db')
const Producto = require('./producto.model')

const VentaItem = db.define('VentaItem', {
  VentaItemId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  VentaId: { type: DataTypes.INTEGER, allowNull: false },
  ProductoId: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precioUnit: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, { tableName: 'ventaitem', timestamps: false })

VentaItem.belongsTo(Producto, { foreignKey: 'ProductoId', as: 'producto' })

module.exports = VentaItem
