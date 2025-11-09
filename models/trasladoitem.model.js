const { DataTypes } = require('sequelize')
const db = require('../db/db')

const TrasladoItem = db.define('TrasladoItem', {
  TrasladoItemId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  TrasladoId: { type: DataTypes.INTEGER, allowNull: false },
  ProductoId: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'trasladoitem', timestamps: false })

module.exports = TrasladoItem
