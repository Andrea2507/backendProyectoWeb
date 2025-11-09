const AuditLog = require('../models/auditlog.model')

async function registrarLog(usuarioId, entidad, entidadId, accion, antes, despues, sucursalId = null) {
  try {
    await AuditLog.create({
      UsuarioId: usuarioId || null,
      entidad,
      entidadId: entidadId || null,
      accion,
      antes: antes ? JSON.stringify(antes) : null,
      despues: despues ? JSON.stringify(despues) : null,
      SucursalId: sucursalId || null
    })
  } catch (e) {
    console.error('Error al registrar en bitácora:', e.message)
  }
}

module.exports = { registrarLog }
