const SucursalModel = require('../models/sucursal.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getSucursales = async (req, res) => {
  try {
    const r = await SucursalModel.findAll()
    await registrarLog(req.user?.id, 'Sucursal', null, 'CONSULTAR', null, { total: r.length })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener las sucursales' })
  }
}

exports.getSucursalById = async (req, res) => {
  try {
    const id = req.params.id
    const r = await SucursalModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Sucursal no encontrada' })
    await registrarLog(req.user?.id, 'Sucursal', id, 'CONSULTAR', null, r)
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener la sucursal' })
  }
}

exports.createSucursal = async (req, res) => {
  try {
    const { nombre, ciudad, direccion } = req.body
    const r = await SucursalModel.create({ nombre, ciudad, direccion })
    await registrarLog(req.user?.id, 'Sucursal', r.SucursalId, 'CREAR', null, r)
    res.status(201).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al crear la sucursal' })
  }
}

exports.updateSucursal = async (req, res) => {
  try {
    const id = req.params.id
    const r = await SucursalModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Sucursal no encontrada' })
    const antes = { ...r.get() }
    const { nombre, ciudad, direccion } = req.body
    r.nombre = nombre
    r.ciudad = ciudad
    r.direccion = direccion
    await r.save()
    await registrarLog(req.user?.id, 'Sucursal', id, 'ACTUALIZAR', antes, r)
    res.json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al actualizar la sucursal' })
  }
}

exports.deleteSucursal = async (req, res) => {
  try {
    const id = req.params.id
    const r = await SucursalModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Sucursal no encontrada' })
    const antes = { ...r.get() }
    await r.destroy()
    await registrarLog(req.user?.id, 'Sucursal', id, 'ELIMINAR', antes, null)
    res.status(200).json({ message: 'Sucursal eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error, message: 'Error al eliminar la sucursal' })
  }
}
