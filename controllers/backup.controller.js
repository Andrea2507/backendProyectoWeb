const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const BackupLog = require('../models/backuplog.model')
const { registrarLog } = require('../middlewares/log.middleware')

function buildDumpCommand(outputPath) {
  const host = process.env.HOST
  const port = process.env.PORT_SQL
  const user = process.env.USER
  const pass = process.env.PASS
  const db = process.env.NAME

  if (process.platform === 'win32') {
    return `"C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe" -h ${host} -P ${port} -u ${user} -p${pass} ${db} > "${outputPath}"`
  }

  return `mysqldump -h ${host} -P ${port} -u ${user} -p${pass} ${db} > "${outputPath}"`
}

exports.generarBackup = async (req, res) => {
  try {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const rutaCarpeta = path.join(__dirname, '../backups')
    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo)

    if (!fs.existsSync(rutaCarpeta)) fs.mkdirSync(rutaCarpeta)

    const comando = buildDumpCommand(rutaArchivo)

    exec(comando, async (error) => {
      if (error) {
        await BackupLog.create({
          tipo,
          ok: 0,
          detalle: error.message,
          ubicacion: rutaArchivo
        })

        return res.status(500).json({
          message: 'Error al generar backup',
          error: error.message
        })
      }

      const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2)

      await BackupLog.create({
        tipo,
        tamanoMB,
        ok: 1,
        ubicacion: rutaArchivo
      })

      await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, {
        archivo: nombreArchivo,
        tamanoMB
      })

      res.json({
        message: 'Backup generado correctamente',
        archivo: nombreArchivo,
        tamanoMB
      })
    })
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
    const rutaCarpeta = path.join(__dirname, '../backups')
    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo)

    if (!fs.existsSync(rutaCarpeta)) fs.mkdirSync(rutaCarpeta)

    const comando = buildDumpCommand(rutaArchivo)

    exec(comando, async (error) => {
      if (error) {
        await BackupLog.create({
          tipo,
          ok: 0,
          detalle: error.message,
          ubicacion: rutaArchivo
        })
      } else {
        const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2)

        await BackupLog.create({
          tipo,
          tamanoMB,
          ok: 1,
          ubicacion: rutaArchivo
        })
      }
    })
  }, dia)
}

exports.listarBackups = async (req, res) => {
  try {
    const carpeta = path.join(__dirname, '../backups')
    if (!fs.existsSync(carpeta)) return res.json([])

    const archivos = fs.readdirSync(carpeta)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const ruta = path.join(carpeta, f)
        const stats = fs.statSync(ruta)
        return {
          nombre: f,
          fecha: stats.mtime.toISOString().split('T')[0],
          tamanoMB: (stats.size / 1024 / 1024).toFixed(2)
        }
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha))

    res.json(archivos)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar backups' })
  }
}
