const ProductoFoto = require('../models/productofoto.model')
//sube una foto al producto
exports.subirFoto = async (req, res) => {
  try {
    const productoId = req.params.productoId
     // req.file la manda Multer, si no existe, no subieron nada
    const url = req.file ? `/uploads/${req.file.filename}` : null
    if (!url) return res.status(400).json({ error: 'Archivo requerido' })
    // guarda la foto en la BD (solo referencia, no el archivo)
      const r = await ProductoFoto.create({ ProductoId: productoId, url, principal: false })
    res.status(201).json(r)
  } catch (e) {
    res.status(500).json({ error: 'Error al subir foto' })
  }
}
//marca una foto como la principal

exports.marcarPrincipal = async (req, res) => {
  try {
    const id = req.params.productoFotoId
    const foto = await ProductoFoto.findByPk(id)
    if (!foto) return res.status(404).json({ error: 'Foto no encontrada' })
      //se desmarcan las fotos del producto
    await ProductoFoto.update({ principal: false }, { where: { ProductoId: foto.ProductoId } })
    foto.principal = true
    await foto.save()
    res.json(foto)
  } catch (e) {
    res.status(500).json({ error: 'Error al marcar principal' })
  }
}
//elimina una foto
exports.eliminarFoto = async (req, res) => {
  try {
    const id = req.params.productoFotoId
    const foto = await ProductoFoto.findByPk(id)
    if (!foto) return res.status(404).json({ error: 'Foto no encontrada' })
    await foto.destroy()
    res.json({ message: 'Foto eliminada' })
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar foto' })
  }
}
//lista las fotos
exports.listarPorProducto = async (req, res) => {
  try {
    const productoId = req.params.productoId
    const r = await ProductoFoto.findAll({ where: { ProductoId: productoId } })
    res.json(r)
  } catch (e) {
    res.status(500).json({ error: 'Error al listar fotos' })
  }
}
