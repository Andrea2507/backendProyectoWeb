const { DataTypes } = require('sequelize')
const db = require('../db/db')

const Cliente = db.define('Cliente', {
  ClienteId: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },

  nombre: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },

  correo: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    unique: true,              // Evita duplicados por correo
    validate: {
      isEmail: true            // Valida que sea un correo real
    }
  },

  telefono: { 
    type: DataTypes.STRING(50), 
    allowNull: true 
  }

}, {
  tableName: 'cliente',
  timestamps: false
})

module.exports = Cliente
