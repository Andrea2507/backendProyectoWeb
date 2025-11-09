const express = require('express')
const router = express.Router()
const c = require('../controllers/categoria.controller')
const { auth, requireRole } = require('../middlewares/auth.middleware')

router.get('/', auth, requireRole(['ADMIN', 'GERENTE']), c.getCategorias)
router.get('/:id', auth, requireRole(['ADMIN', 'GERENTE']), c.getCategoriaById)
router.post('/', auth, requireRole(['ADMIN']), c.createCategoria)
router.put('/:id', auth, requireRole(['ADMIN']), c.updateCategoria)
router.delete('/:id', auth, requireRole(['ADMIN']), c.deleteCategoria)

module.exports = router
