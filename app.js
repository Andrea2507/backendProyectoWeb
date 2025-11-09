require('dotenv').config();

const express = require('express')
const cors = require('cors')
const sequelize = require('./db/db')
const auditlogRoutes = require('./routes/auditlog.routes')
const productoFotoRoutes = require('./routes/productofoto.routes')
const productoRoutes = require('./routes/producto.routes')
const sucursalRoutes = require('./routes/sucursal.routes')
const stockRoutes = require('./routes/stock.routes')
const trasladoRoutes = require('./routes/traslado.routes')
const ventaRoutes = require('./routes/venta.routes')

const authRoutes = require('./routes/auth.routes')
const usuarioRoutes = require('./routes/usuario.routes')
const rutasCategoria = require('./routes/categoria.routes')
const reporteRoutes = require('./routes/reporte.routes')
const { programarBackup } = require('./controllers/backup.controller')
const backupRoutes = require('./routes/backup.routes')
const Producto = require('./models/producto.model')
const ProductoFoto = require('./models/productofoto.model')
const Stock = require('./models/stock.model')
const Sucursal = require('./models/sucursal.model')
const Traslado = require('./models/traslado.model')
const TrasladoItem = require('./models/trasladoitem.model')
const Usuario = require('./models/usuario.model')
const clienteRoutes = require('./routes/cliente.routes')

const app = express()
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente ')
})

// Rutas
app.use('/backup', backupRoutes)
app.use('/cotizacion', require('./routes/cotizacion.routes'))
app.use('/clientes', clienteRoutes)
app.use('/productofotos', productoFotoRoutes)
app.use('/uploads', express.static('uploads'))
app.use('/reporte', reporteRoutes)
app.use('/categorias', rutasCategoria)
app.use('/productos', productoRoutes)
app.use('/sucursales', sucursalRoutes)
app.use('/stock', stockRoutes)
app.use('/traslados', trasladoRoutes)
app.use('/ventas', ventaRoutes)

app.use('/auth', authRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/reportes', reporteRoutes)
app.use('/auditlog', auditlogRoutes)

// Backup automático
programarBackup()

// Relaciones
Producto.hasMany(ProductoFoto, { as: 'Fotos', foreignKey: 'ProductoId' })
ProductoFoto.belongsTo(Producto, { foreignKey: 'ProductoId' })

Producto.hasMany(Stock, { as: 'Stock', foreignKey: 'ProductoId' })
Stock.belongsTo(Producto, { foreignKey: 'ProductoId' })

Sucursal.hasMany(Stock, { as: 'StockSucursal', foreignKey: 'SucursalId' })
Stock.belongsTo(Sucursal, { foreignKey: 'SucursalId' })

Sucursal.hasMany(Traslado, { as: 'TrasladosOrigen', foreignKey: 'OrigenId' })
Sucursal.hasMany(Traslado, { as: 'TrasladosDestino', foreignKey: 'DestinoId' })
Traslado.belongsTo(Sucursal, { as: 'Origen', foreignKey: 'OrigenId' })
Traslado.belongsTo(Sucursal, { as: 'Destino', foreignKey: 'DestinoId' })

Usuario.hasMany(Traslado, { as: 'TrasladosUsuario', foreignKey: 'UsuarioId' })
Traslado.belongsTo(Usuario, { as: 'Usuario', foreignKey: 'UsuarioId' })

Traslado.hasMany(TrasladoItem, { as: 'Items', foreignKey: 'TrasladoId' })
TrasladoItem.belongsTo(Traslado, { as: 'Traslado', foreignKey: 'TrasladoId' })

Producto.hasMany(TrasladoItem, { as: 'ItemsProducto', foreignKey: 'ProductoId' })
TrasladoItem.belongsTo(Producto, { foreignKey: 'ProductoId' })


const PORT = process.env.PORT || 3001


sequelize.authenticate()
  .then(() => console.log('Conectado a Railway MySQL correctamente'))
  .catch(err => console.error('Error de conexión a BD:', err))

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))
  })
  .catch(err => console.error(err))

module.exports = app
