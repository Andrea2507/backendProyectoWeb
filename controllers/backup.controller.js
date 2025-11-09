const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const BackupLog = require('../models/backuplog.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.generarBackup = async (req, res) => {
  try {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const rutaCarpeta = path.join(__dirname, '../backups')
    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo)

    if (!fs.existsSync(rutaCarpeta)) fs.mkdirSync(rutaCarpeta)

    // Ruta y usuario configurados para Laragon (MySQL 8.4.3)
    const comando = `"C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe" -u backupuser -p123 proyectofinal > "${rutaArchivo}"`

    console.log('Ejecutando comando:', comando)

    exec(comando, async (error, stdout, stderr) => {
      if (error) {
        console.error('Error al ejecutar mysqldump:', error.message)
        console.error('STDERR:', stderr)
        return res.status(500).json({ message: 'Error al generar backup', error: error.message })
      }

      const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2)
      console.log('Backup creado:', rutaArchivo, tamanoMB + 'MB')

      await BackupLog.create({
        tipo,
        tamanoMB,
        ok: 1,
        ubicacion: rutaArchivo
      })

      await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, { archivo: nombreArchivo, tamanoMB })

      res.status(200).json({ message: 'Backup generado correctamente', archivo: nombreArchivo, tamanoMB })
    })
  } catch (e) {
    console.error('Error interno en generarBackup:', e)
    res.status(500).json({ message: 'Error interno al generar backup', error: e.message })
  }
}

exports.programarBackup = () => {
  const diaEnMs = 24 * 60 * 60 * 1000
  setInterval(async () => {
    const tipo = 'COMPLETO'
    const fecha = new Date()
    const nombreArchivo = `backup_auto_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const rutaCarpeta = path.join(__dirname, '../backups')
    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo)

    if (!fs.existsSync(rutaCarpeta)) fs.mkdirSync(rutaCarpeta)

    const comando = `"C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe" -u backupuser -p123 proyectofinal > "${rutaArchivo}"`

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
  }, diaEnMs)
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
      .sort((a, b) => b.fecha.localeCompare(a.fecha)) // más recientes arriba

    res.json(archivos)
  } catch (err) {
    console.error('Error al listar backups:', err)
    res.status(500).json({ message: 'Error al listar backups' })
  }
}

