const { DataTypes } = require('sequelize')
const db = require('../db/db')
const VentaItem = require('./ventaitem.model')

const Venta = db.define('Venta', {
  VentaId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ClienteId: { type: DataTypes.INTEGER, allowNull: true },
  SucursalId: { type: DataTypes.INTEGER, allowNull: false },
  UsuarioId: { type: DataTypes.INTEGER, allowNull: true },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0.00 },
  estado: { type: DataTypes.ENUM('PAGADA','ESPERANDO_PAGO','ANULADA'), defaultValue: 'ESPERANDO_PAGO' },
  metodoPago: { type: DataTypes.ENUM('TARJETA','CONTRA_ENTREGA'), allowNull: false },
  nota: { type: DataTypes.STRING(300) },
  nombreCliente: { type: DataTypes.STRING(100) },
  correoCliente: { type: DataTypes.STRING(100) },
  direccionCliente: { type: DataTypes.STRING(300) },
  telefonoCliente: { type: DataTypes.STRING(50) }
}, { tableName: 'venta', timestamps: false })

Venta.hasMany(VentaItem, { foreignKey: 'VentaId', as: 'items' })

module.exports = Venta
