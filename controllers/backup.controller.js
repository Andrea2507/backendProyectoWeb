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
    const folder = path.join(__dirname, '../backups')
    const file = path.join(folder, nombreArchivo)

    if (!fs.existsSync(folder)) fs.mkdirSync(folder)

    const comando = buildDumpCommand(file)

    console.log('COMANDO:', comando)

    exec(comando, async (error, stdout, stderr) => {
      console.log('STDOUT:', stdout)
      console.log('STDERR:', stderr)
      console.log('ERROR:', error)

      if (error) {
        await BackupLog.create({ tipo, ok: 0, detalle: error.message, ubicacion: file })
        return res.status(500).json({ message: 'Error al generar backup' })
      }

      const tamanoMB = (fs.statSync(file).size / 1024 / 1024).toFixed(2)

      await BackupLog.create({ tipo, tamanoMB, ok: 1, ubicacion: file })
      await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, { archivo: nombreArchivo, tamanoMB })

      res.json({ message: 'Backup generado correctamente', archivo: nombreArchivo, tamanoMB })
    })
  } catch (e) {
    console.log('ERROR INTERNO:', e)
    res.status(500).json({ message: 'Error interno al generar backup' })
  }
}

exports.programarBackup = () => {
  const dia = 24 * 60 * 60 * 1000

  setInterval(async () => {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_auto_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const folder = path.join(__dirname, '../backups')
    const file = path.join(folder, nombreArchivo)

    if (!fs.existsSync(folder)) fs.mkdirSync(folder)

    const comando = buildDumpCommand(file)

    exec(comando, async (error, stdout, stderr) => {
      console.log('AUTO_BACKUP_STDOUT:', stdout)
      console.log('AUTO_BACKUP_STDERR:', stderr)
      console.log('AUTO_BACKUP_ERROR:', error)

      if (error) {
        await BackupLog.create({ tipo, ok: 0, detalle: error.message, ubicacion: file })
      } else {
        const tamanoMB = (fs.statSync(file).size / 1024 / 1024).toFixed(2)
        await BackupLog.create({ tipo, tamanoMB, ok: 1, ubicacion: file })
      }
    })
  }, dia)
}

exports.listarBackups = async (req, res) => {
  try {
    const folder = path.join(__dirname, '../backups')
    if (!fs.existsSync(folder)) return res.json([])

    const archivos = fs.readdirSync(folder)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const ruta = path.join(folder, f)
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
    console.log('LISTAR_BACKUPS_ERROR:', err)
    res.status(500).json({ message: 'Error al listar backups' })
  }
}
