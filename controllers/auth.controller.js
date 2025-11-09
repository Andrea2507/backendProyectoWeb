const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario.model')
const { registrarLog } = require('../middlewares/log.middleware')


//crrea un uevo ususario
async function registrar(req, res) {
  try {
    const { nombre, correo, contraseña, rol, SucursalId } = req.body
    const hash = await bcrypt.hash(contraseña, 10) //contraseña encriptada
    const nuevo = await Usuario.create({
      nombre,
      correo,
      password_hash: hash,
      rol,
      SucursalId
    })
    await registrarLog(null, 'Usuario', nuevo.UsuarioId, 'REGISTRO', null, nuevo)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al registrar usuario' })
  }
}

//login

async function login(req, res) {
  try {
    const { correo, contraseña } = req.body
    const usuario = await Usuario.findOne({ where: { correo } })
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })

    const ok = await bcrypt.compare(contraseña, usuario.password_hash)
    if (!ok) return res.status(401).json({ message: 'Contraseña incorrecta' })

      //genera token que expira en 8 horas
    const token = jwt.sign(
      { id: usuario.UsuarioId, rol: usuario.rol },
      'clave_secreta_backend',
      { expiresIn: '8h' }
    )

    await registrarLog(
      usuario.UsuarioId,
      'Usuario',
      usuario.UsuarioId,
      'LOGIN',
      null,
      { mensaje: 'Inicio de sesión exitoso' }
    )

    res.status(200).json({
      token,
      usuario: {
        UsuarioId: usuario.UsuarioId,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        SucursalId: usuario.SucursalId,
        activo: usuario.activo
      }
    })
  } catch (error) {
    res.status(500).json({ error, message: 'Error al iniciar sesión' })
  }
}

module.exports = { registrar, login }
