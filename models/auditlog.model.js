const { DataTypes } = require('sequelize')
const db = require('../db/db')
const Usuario = require('./usuario.model')
const Sucursal = require('./sucursal.model')

const AuditLog = db.define('AuditLog', {
  LogId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  UsuarioId: { type: DataTypes.INTEGER },
  entidad: { type: DataTypes.STRING(40), allowNull: false },
  entidadId: { type: DataTypes.INTEGER },
  accion: { type: DataTypes.STRING(20), allowNull: false },
  antes: { type: DataTypes.JSON },
  despues: { type: DataTypes.JSON },
  SucursalId: { type: DataTypes.INTEGER },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
  tableName: 'auditlog', 
  timestamps: false 
})

// Relaciones
AuditLog.belongsTo(Usuario, { foreignKey: 'UsuarioId', as: 'usuario' })
AuditLog.belongsTo(Sucursal, { foreignKey: 'SucursalId' })

module.exports = AuditLog
