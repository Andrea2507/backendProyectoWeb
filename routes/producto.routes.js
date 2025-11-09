const express = require('express')
const router = express.Router()
const c = require('../controllers/producto.controller')
const { auth, requireRole } = require('../middlewares/auth.middleware')


router.get('/', c.getProductos)
router.get('/:id', c.getProductoById)
router.post('/buscar', c.getProductoByNombre)


router.post('/', auth, requireRole(['ADMIN', 'GERENTE']), c.createProducto)
router.put('/:id', auth, requireRole(['ADMIN', 'GERENTE']), c.updateProducto)
router.delete('/:id', auth, requireRole(['ADMIN', 'GERENTE']), c.deleteProducto)

module.exports = router
