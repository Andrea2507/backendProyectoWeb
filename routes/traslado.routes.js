const express = require('express')
const router = express.Router()
const trasladoController = require('../controllers/traslado.controller')

router.get('/', trasladoController.getTraslados)
router.post('/', trasladoController.createTraslado)

module.exports = router
