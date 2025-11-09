const { DataTypes } = require('sequelize')
const db = require('../db/db')
const Cotizacion = require('./cotizacion.model')
const Producto = require('./producto.model')

const CotizacionItem = db.define('CotizacionItem', {
  CotizacionItemId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  CotizacionId: { type: DataTypes.INTEGER, allowNull: false },
  ProductoId: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precioUnit: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, { tableName: 'cotizacionitem', timestamps: false })

// Relaciones
Cotizacion.hasMany(CotizacionItem, { as: 'items', foreignKey: 'CotizacionId' })
CotizacionItem.belongsTo(Cotizacion, { foreignKey: 'CotizacionId' })
CotizacionItem.belongsTo(Producto, { as: 'producto', foreignKey: 'ProductoId' })

module.exports = CotizacionItem
