const { DataTypes } = require('sequelize')
const db = require('../db/db')

const ProductoFoto = db.define('ProductoFoto', {
  ProductoFotoId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ProductoId: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING(300), allowNull: false },
  principal: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'productoFoto', timestamps: false })

module.exports = ProductoFoto
