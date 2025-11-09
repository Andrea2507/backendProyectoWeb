const express = require('express')
const router = express.Router()
const { obtenerLogs } = require('../controllers/auditlog.controller')
const { auth, requireRole } = require('../middlewares/auth.middleware')


router.get('/', auth, requireRole(['GERENTE']), obtenerLogs)

module.exports = router
