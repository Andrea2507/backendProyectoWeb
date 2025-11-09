const StockModel = require('../models/stock.model')
const Sucursal = require('../models/sucursal.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getStock = async (req, res) => {
  try {
    const r = await StockModel.findAll()
    await registrarLog(req.user?.id, 'Stock', null, 'CONSULTAR', null, { total: r.length })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener el stock' })
  }
}

exports.getStockByIds = async (req, res) => {
  try {
    const { sucursalId, productoId } = req.params
    const r = await StockModel.findOne({ where: { SucursalId: sucursalId, ProductoId: productoId } })
    if (!r) return res.status(404).json({ error: 'Registro no encontrado' })
    await registrarLog(req.user?.id, 'Stock', `${sucursalId}-${productoId}`, 'CONSULTAR', null, r)
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener el stock' })
  }
}

exports.createStock = async (req, res) => {
  try {
    const { SucursalId, ProductoId, existencias } = req.body
    const r = await StockModel.create({ SucursalId, ProductoId, existencias })
    await registrarLog(req.user?.id, 'Stock', `${SucursalId}-${ProductoId}`, 'CREAR', null, r)
    res.status(201).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al crear el registro de stock' })
  }
}

exports.updateStock = async (req, res) => {
  try {
    const { sucursalId, productoId } = req.params
    const r = await StockModel.findOne({ where: { SucursalId: sucursalId, ProductoId: productoId } })
    if (!r) return res.status(404).json({ error: 'Registro no encontrado' })
    const antes = { ...r.get() }
    const { existencias } = req.body
    r.existencias = existencias
    await r.save()
    await registrarLog(req.user?.id, 'Stock', `${sucursalId}-${productoId}`, 'ACTUALIZAR', antes, r)
    res.json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al actualizar el stock' })
  }
}

exports.deleteStock = async (req, res) => {
  try {
    const { sucursalId, productoId } = req.params
    const r = await StockModel.findOne({ where: { SucursalId: sucursalId, ProductoId: productoId } })
    if (!r) return res.status(404).json({ error: 'Registro no encontrado' })
    const antes = { ...r.get() }
    await r.destroy()
    await registrarLog(req.user?.id, 'Stock', `${sucursalId}-${productoId}`, 'ELIMINAR', antes, null)
    res.status(200).json({ message: 'Registro eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error, message: 'Error al eliminar el registro' })
  }
}

exports.getStockPorProducto = async (req, res) => {
  try {
    const productoId = req.params.id
    const registros = await StockModel.findAll({
      where: { ProductoId: productoId },
      include: [{ model: Sucursal }],
      order: [['SucursalId', 'ASC']]
    })
    res.status(200).json(registros)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener el stock del producto' })
  }
}
