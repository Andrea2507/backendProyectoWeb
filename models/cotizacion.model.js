const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Cotizacion = db.define('Cotizacion', {
  CotizacionId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ClienteId: { type: DataTypes.INTEGER },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cotizacion',
  timestamps: false
})

module.exports = Cotizacion
