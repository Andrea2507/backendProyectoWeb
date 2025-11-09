const express = require('express')
const router = express.Router()
const upload = require('../middlewares/subida.middleware')
const c = require('../controllers/productofoto.controller')
const { auth, requireRole } = require('../middlewares/auth.middleware')

router.post('/:productoId', auth, requireRole(['ADMIN','GERENTE']), upload.single('foto'), c.subirFoto)
router.put('/:productoFotoId/principal', auth, requireRole(['ADMIN','GERENTE']), c.marcarPrincipal)
router.delete('/:productoFotoId', auth, requireRole(['ADMIN','GERENTE']), c.eliminarFoto)
router.get('/producto/:productoId', auth, requireRole(['ADMIN','GERENTE']), c.listarPorProducto)

module.exports = router
