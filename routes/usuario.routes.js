const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuario.controller')
const { auth, requireRole } = require('../middlewares/auth.middleware')

// GERENTE y ADMIN pueden listar y ver usuarios
router.get('/', auth, requireRole(['ADMIN', 'GERENTE']), usuarioController.getUsuarios)
router.get('/:id', auth, requireRole(['ADMIN', 'GERENTE']), usuarioController.getUsuarioPorId)

// Solo ADMIN puede crear, editar o cambiar estado
router.post('/', auth, requireRole(['ADMIN']), usuarioController.createUsuario)
router.put('/:id', auth, requireRole(['ADMIN']), usuarioController.updateUsuario)


router.patch('/:id/estado', auth, requireRole(['ADMIN']), usuarioController.cambiarEstadoUsuario)

module.exports = router
