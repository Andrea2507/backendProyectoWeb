const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Traslado = db.define('Traslado', {
  TrasladoId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  OrigenId: { type: DataTypes.INTEGER, allowNull: false },
  DestinoId: { type: DataTypes.INTEGER, allowNull: false },
  UsuarioId: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.STRING(20), defaultValue: 'COMPLETADO' }
}, { tableName: 'traslado', timestamps: false })

module.exports = Traslado
