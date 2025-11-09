const CategoriaModel = require('../models/categoria.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getCategorias = async (req, res) => {
  try {
    const r = await CategoriaModel.findAll()
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener las categorías' })
  }
}

exports.getCategoriaById = async (req, res) => {
  try {
    const id = req.params.id
    const r = await CategoriaModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener la categoría' })
  }
}

exports.getCategoriaByNombre = async (req, res) => {
  try {
    const { nombre } = req.body
    const r = await CategoriaModel.findOne({ where: { nombre } })
    if (!r) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.status(200).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al obtener la categoría' })
  }
}

exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body
    const r = await CategoriaModel.create({ nombre })
    await registrarLog(req.user?.id, 'Categoria', r.CategoriaId, 'CREAR', null, r)
    res.status(201).json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al crear la categoría' })
  }
}

exports.updateCategoria = async (req, res) => {
  try {
    const id = req.params.id
    const r = await CategoriaModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Categoría no encontrada' })
    const antes = { ...r.get() }
    const { nombre } = req.body
    r.nombre = nombre
    await r.save()
    await registrarLog(req.user?.id, 'Categoria', r.CategoriaId, 'EDITAR', antes, r)
    res.json(r)
  } catch (error) {
    res.status(500).json({ error, message: 'Error al actualizar la categoría' })
  }
}

exports.deleteCategoria = async (req, res) => {
  try {
    const id = req.params.id
    const r = await CategoriaModel.findByPk(id)
    if (!r) return res.status(404).json({ error: 'Categoría no encontrada' })
    await registrarLog(req.user?.id, 'Categoria', id, 'ELIMINAR', r, null)
    await r.destroy()
    res.status(200).json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error, message: 'Error al eliminar la categoría' })
  }
}
