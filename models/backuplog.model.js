const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

const BackupLog = sequelize.define('BackupLog', {
  BackupLogId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tamanoMB: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  ok: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  detalle: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'backuplog',
  timestamps: false
})

module.exports = BackupLog
