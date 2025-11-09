const express = require('express')
const router = express.Router()
const c = require('../controllers/stock.controller')

router.get('/', c.getStock)

router.get('/producto/:id', c.getStockPorProducto)

router.get('/:sucursalId/:productoId', c.getStockByIds)
router.post('/', c.createStock)
router.put('/:sucursalId/:productoId', c.updateStock)
router.delete('/:sucursalId/:productoId', c.deleteStock)

module.exports = router
