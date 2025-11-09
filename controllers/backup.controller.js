const fs = require('fs')
const path = require('path')
const BackupLog = require('../models/backuplog.model')
const { registrarLog } = require('../middlewares/log.middleware')
const sequelize = require('../db/db')

async function generarArchivo(nombreArchivo) {
  const carpeta = path.join(__dirname, '../backups')
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta)
  const ruta = path.join(carpeta, nombreArchivo)

  let contenido = ''
  const [tablas] = await sequelize.query('SHOW TABLES')

  for (const fila of tablas) {
    const tabla = Object.values(fila)[0]
    const [[create]] = await sequelize.query(`SHOW CREATE TABLE \`${tabla}\``)
    contenido += `DROP TABLE IF EXISTS \`${tabla}\`;\n`
    contenido += create['Create Table'] + ';\n\n'

    const [rows] = await sequelize.query(`SELECT * FROM \`${tabla}\``)
    for (const row of rows) {
      const columnas = Object.keys(row).map(c => `\`${c}\``).join(',')
      const valores = Object.values(row)
        .map(v => v === null ? 'NULL' : `'${v.toString().replace(/'/g, "''")}'`)
        .join(',')
      contenido += `INSERT INTO \`${tabla}\` (${columnas}) VALUES (${valores});\n`
    }

    contenido += '\n\n'
  }

  fs.writeFileSync(ruta, contenido)
  return ruta
}

exports.generarBackup = async (req, res) => {
  try {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const rutaArchivo = await generarArchivo(nombreArchivo)
    const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2)

    await BackupLog.create({ tipo, tamanoMB, ok: 1, ubicacion: rutaArchivo })
    await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, { archivo: nombreArchivo, tamanoMB })

    res.json({ message: 'Backup generado correctamente', archivo: nombreArchivo, tamanoMB })
  } catch (e) {
    res.status(500).json({ message: 'Error interno al generar backup', error: e.message })
  }
}

exports.programarBackup = () => {
  const dia = 24 * 60 * 60 * 1000
  setInterval(async () => {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_auto_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`

    try {
      const rutaArchivo = await generarArchivo(nombreArchivo)
      const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2)
      await BackupLog.create({ tipo, tamanoMB, ok: 1, ubicacion: rutaArchivo })
    } catch (err) {
      await BackupLog.create({ tipo, ok: 0, detalle: err.message, ubicacion: nombreArchivo })
    }
  }, dia)
}

exports.listarBackups = async (req, res) => {
  try {
    const registros = await BackupLog.findAll({ order: [['BackupLogId', 'DESC']] })

    const lista = registros.map(r => ({
      id: r.BackupLogId,
      fecha: r.fecha ? r.fecha.toISOString().split('T')[0] : '',
      tamanoMB: r.tamanoMB,
      nombre: `backup_${r.BackupLogId}.sql`
    }))

    res.json(lista)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar backups' })
  }
}

exports.descargarBackup = async (req, res) => {
  try {
    const id = req.params.id

    const registro = await BackupLog.findByPk(id)
    if (!registro) return res.status(404).json({ message: 'Backup no encontrado' })

    const ruta = registro.ubicacion

    if (!fs.existsSync(ruta)) return res.status(404).json({ message: 'Archivo no encontrado' })

    res.download(ruta, `backup_${id}.sql`)
  } catch (err) {
    res.status(500).json({ message: 'Error al descargar backup' })
  }
}
