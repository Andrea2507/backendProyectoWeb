const bcrypt = require('bcryptjs')
const Usuario = require('../models/usuario.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getUsuarios = async (req, res) => {
  try {
    const lista = await Usuario.findAll({ include: ['Sucursal'] })
    res.json(lista)
  } catch (error) {
    res.status(500).json({ error, mensaje: 'Error al obtener usuarios' })
  }
}

exports.getUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params
    const u = await Usuario.findByPk(id)
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    res.json(u)
  } catch (error) {
    res.status(500).json({ error, mensaje: 'Error al obtener usuario' })
  }
}

exports.createUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol, SucursalId } = req.body
    const hash = await bcrypt.hash(password, 10)
    const nuevo = await Usuario.create({
      nombre,
      correo,
      password_hash: hash,
      rol,
      SucursalId,
      activo: 1
    })
    await registrarLog(req.user?.id, 'Usuario', nuevo.UsuarioId, 'CREAR', null, nuevo)
    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ error, mensaje: 'Error al crear usuario' })
  }
}

exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, correo, password, rol, SucursalId, activo } = req.body
    const u = await Usuario.findByPk(id)
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    const antes = { ...u.get() }
    const datos = { nombre, correo, rol, SucursalId, activo }
    if (password) datos.password_hash = await bcrypt.hash(password, 10)
    await u.update(datos)
    await registrarLog(req.user?.id, 'Usuario', u.UsuarioId, 'EDITAR', antes, u)
    res.json(u)
  } catch (error) {
    res.status(500).json({ error, mensaje: 'Error al actualizar usuario' })
  }
}

exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findByPk(id)
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

    const nuevoEstado = usuario.activo ? 0 : 1
    await usuario.update({ activo: nuevoEstado })

    await registrarLog(
      req.user?.id,
      'Usuario',
      usuario.UsuarioId,
      nuevoEstado ? 'ACTIVAR' : 'DESACTIVAR',
      null,
      usuario
    )

    res.json({ mensaje: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente` })
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error)
    res.status(500).json({ error, mensaje: 'Error al cambiar estado del usuario' })
  }
}
