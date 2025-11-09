const { Op } = require('sequelize')
const Producto = require('../models/producto.model')
const ProductoFoto = require('../models/productofoto.model')
const Stock = require('../models/stock.model')
const { registrarLog } = require('../middlewares/log.middleware')

//agarra los productos
exports.getProductos = async (req, res) => {
  try {
    const { sucursalId } = req.query
    //incluir foto
    const include = [{ model: ProductoFoto, as: 'Fotos', attributes: ['ProductoFotoId', 'url', 'principal'] }]

    if (sucursalId) {
      //filtro para que los productos con existencia se mmuestren en la sucrusal
      include.push({
        model: Stock,
        as: 'Stock',
        where: { SucursalId: sucursalId, existencias: { [Op.gt]: 0 } }, // Op.gt = mayor que
        required: true, //si no hay stock no se muestra el producto
        attributes: ['SucursalId', 'existencias']
      })
    } else {
      include.push({
        model: Stock,
        as: 'Stock',
        attributes: ['SucursalId', 'existencias']
      })
    }

    const productos = await Producto.findAll({ include, order: [['ProductoId', 'ASC']] })
    res.status(200).json(productos)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener los productos' })
  }
}
//se obtienen por id

exports.getProductoById = async (req, res) => {
  try {
    const id = req.params.id
    const r = await Producto.findByPk(id, {
      include: { model: ProductoFoto, as: 'Fotos' }
    })
    if (!r) return res.status(404).json({ error: 'Producto no encontrado' })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener el producto' })
  }
}
//buscar por nombre
exports.getProductoByNombre = async (req, res) => {
  try {
    const { nombre } = req.body
    const r = await Producto.findOne({ where: { nombre } })
    if (!r) return res.status(404).json({ error: 'Producto no encontrado' })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener el producto' })
  }
}
//crear producto con stock inicial
exports.createProducto = async (req, res) => {
  try {
    const { sku, nombre, descripcion, precio, marca, CategoriaId, activo, SucursalId, existencias } = req.body
    const r = await Producto.create({ sku, nombre, descripcion, precio, marca, CategoriaId, activo })
   // si envían sucursal y existencias, también crea el stock inicial
    if (SucursalId && existencias !== undefined) {
      await Stock.create({
        SucursalId,
        ProductoId: r.ProductoId,
        existencias
      })
    }

    await registrarLog(req.user?.id, 'Producto', r.ProductoId, 'CREAR', null, r)
    res.status(201).json(r)
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error, message: 'Error al crear el producto' })
  }
}
//editar el producto y su stock
exports.updateProducto = async (req, res) => {
  try {
    const id = req.params.id
    const producto = await Producto.findByPk(id, { include: { model: Stock, as: 'Stock' } })
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

    const antes = { ...producto.get() }//sirve parael log
    const { nombre, descripcion, precio, CategoriaId, existencias, SucursalId } = req.body
    //actualizar datos
    if (nombre !== undefined) producto.nombre = nombre
    if (descripcion !== undefined) producto.descripcion = descripcion
    if (precio !== undefined) producto.precio = precio
    if (CategoriaId !== undefined) producto.CategoriaId = CategoriaId

    await producto.save()
//si ya hay stock, actualizarlo, sino crrarnuevo stock
    if (existencias !== undefined && producto.Stock && producto.Stock.length > 0) {
      const stock = producto.Stock[0]
      stock.existencias = existencias
      await stock.save()
    } else if (existencias !== undefined && SucursalId) {
      await Stock.create({
        SucursalId,
        ProductoId: producto.ProductoId,
        existencias
      })
    }

    await registrarLog(req.user?.id, 'Producto', producto.ProductoId, 'EDITAR', antes, producto)
    res.json(producto)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al actualizar el producto' })
  }
}
//eliminar producto
exports.deleteProducto = async (req, res) => {
  try {
    const id = req.params.id
    const producto = await Producto.findByPk(id)

    if (!producto)
      return res.status(404).json({ error: 'Producto no encontrado' })

    // Registrar log si existe usuario
    await registrarLog(req.user?.id || null, 'Producto', id, 'ELIMINAR', producto, null)

    // Eliminar dependencias para evitar error de clave foránea
    await ProductoFoto.destroy({ where: { ProductoId: id } })
    await Stock.destroy({ where: { ProductoId: id } })

    // Eliminar producto
    await producto.destroy()

    res.status(200).json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({
      message: 'Error al eliminar el producto',
      error: error.message
    })
  }
}
