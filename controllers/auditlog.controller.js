const AuditLog = require('../models/auditlog.model')
const Usuario = require('../models/usuario.model')
const Sucursal = require('../models/sucursal.model')
//obtiene toods los logs con info del usuario y sucursal
async function obtenerLogs(req, res) {
  try {
    const registros = await AuditLog.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }, //usuario que hizo algo
        { model: Sucursal, attributes: ['nombre'] } //sucursal donde paso
      ],
      order: [['fecha', 'DESC']]
    })
    res.status(200).json(registros)
  } catch (error) {
    console.error('Error al obtener la bitácora:', error)
    res.status(500).json({ error: error.message, message: 'Error al obtener la bitácora' })
  }
}

module.exports = { obtenerLogs }
