const express = require('express')
const router = express.Router()
const c = require('../controllers/sucursal.controller')

router.get('/', c.getSucursales)
router.get('/:id', c.getSucursalById)
router.post('/', c.createSucursal)
router.put('/:id', c.updateSucursal)
router.delete('/:id', c.deleteSucursal)

module.exports = router
