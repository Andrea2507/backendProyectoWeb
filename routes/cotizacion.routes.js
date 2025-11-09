const express = require('express')
const router = express.Router()
const c = require('../controllers/cotizacion.controller')

router.post('/pdf', c.generarPDFCotizacion)

module.exports = router
