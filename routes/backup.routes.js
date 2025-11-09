const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { generarBackup, programarBackup } = require('../controllers/backup.controller')
const { auth } = require('../middlewares/auth.middleware')

//  Generar backup manual
router.post('/crear', auth, generarBackup)

//  Descargar un backup existente
router.get('/descargar/:nombre', auth, (req, res) => {
  try {
    const nombreArchivo = req.params.nombre
    const rutaArchivo = path.join(__dirname, `../backups/${nombreArchivo}`)

    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({ message: 'Archivo no encontrado' })
    }

    res.download(rutaArchivo)
  } catch (err) {
    console.error('Error al descargar backup:', err)
    res.status(500).json({ message: 'Error al descargar backup' })
  }
})

//  Listar todos los backups disponibles
router.get('/listar', auth, (req, res) => {
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
    console.error('Error al listar backups:', err)
    res.status(500).json({ message: 'Error al listar backups' })
  }
})

module.exports = router
