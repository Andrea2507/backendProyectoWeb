const express = require('express')
const router = express.Router()
const { generarBackup, listarBackups, descargarBackup } = require('../controllers/backup.controller')
const { auth } = require('../middlewares/auth.middleware')

// Generar backup manual
router.post('/crear', auth, generarBackup)

// Listar backups
router.get('/listar', auth, listarBackups)

// Descargar backup por ID
router.get('/descargar/:id', auth, descargarBackup)

module.exports = router
