const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ message: 'Token requerido' })

    const token = header.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token inválido' })

    const decoded = jwt.verify(token, 'clave_secreta_backend')
    req.user = decoded
    next()
  } catch (err) {
    console.error('Error en auth:', err)
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.rol) {
        return res.status(401).json({ message: 'Token requerido' })
      }

      const usuarioRol = req.user.rol.toUpperCase()
      const rolesMayus = roles.map(r => r.toUpperCase())

     if (usuarioRol === 'GERENTE') {
     // gerente puede entrar a rutas de gerente o admin
       return next()
      }

    if (usuarioRol === 'ADMIN' && rolesMayus.includes('ADMIN')) {
      // admin SOLO entra a rutas para admin
      return next()
    }


      return res.status(403).json({ message: `Acceso denegado para rol ${usuarioRol}` })
    } catch (err) {
      console.error('Error en requireRole:', err)
      return res.status(500).json({ message: 'Error en verificación de rol' })
    }
  }
}


module.exports = { auth, requireRole }

module.exports.verificarToken = auth
