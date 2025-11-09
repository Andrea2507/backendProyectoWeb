const Producto = require('./producto.model')
const ProductoFoto = require('./productofoto.model')
const Stock = require('./stock.model')
const Sucursal = require('./sucursal.model')

// Producto Fotos
Producto.hasMany(ProductoFoto, { foreignKey: 'ProductoId', as: 'Fotos' })
ProductoFoto.belongsTo(Producto, { foreignKey: 'ProductoId' })

// Producto  Stock
Producto.hasMany(Stock, { foreignKey: 'ProductoId', as: 'Stock' })
Stock.belongsTo(Producto, { foreignKey: 'ProductoId' })

// Stock Sucursal
Sucursal.hasMany(Stock, { foreignKey: 'SucursalId', as: 'StockSucursal' })
Stock.belongsTo(Sucursal, { foreignKey: 'SucursalId' })

module.exports = { Producto, ProductoFoto, Stock, Sucursal }
