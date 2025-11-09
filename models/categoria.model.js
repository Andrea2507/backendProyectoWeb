const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Categoria = db.define('Categoria', {
  CategoriaId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true }
}, { tableName: 'Categoria', timestamps: false })

module.exports = Categoria
