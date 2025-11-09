const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Stock = db.define('Stock', {
  StockId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  SucursalId: { type: DataTypes.INTEGER, allowNull: false },
  ProductoId: { type: DataTypes.INTEGER, allowNull: false },
  existencias: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'Stock',
  timestamps: false,
  indexes: [{ unique: true, fields: ['SucursalId', 'ProductoId'] }]
})

module.exports = Stock
