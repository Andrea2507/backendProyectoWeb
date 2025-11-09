const Traslado = require('../models/traslado.model')
const TrasladoItem = require('../models/trasladoitem.model')
const Stock = require('../models/stock.model')
const Producto = require('../models/producto.model')
const Sucursal = require('../models/sucursal.model')
const Usuario = require('../models/usuario.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getTraslados = async (req, res) => {
  try {
    const traslados = await Traslado.findAll({
      include: [
        {
          model: TrasladoItem,
          as: 'Items',
          include: [{ model: Producto }]
        },
        { model: Sucursal, as: 'Origen' },
        { model: Sucursal, as: 'Destino' },
        { model: Usuario, as: 'Usuario' }
      ],
      order: [['fecha', 'DESC']]
    })
    res.status(200).json(traslados)
  } catch (error) {
    console.error('Error detallado en getTraslados:')
    console.error(error.message)
    console.error(error.stack)
    res.status(500).json({ message: 'Error al obtener traslados' })
  }
}

exports.createTraslado = async (req, res) => {
  const t = await Traslado.sequelize.transaction()
  try {
    const OrigenId = req.body.OrigenId
    const DestinoId = req.body.DestinoId
    const UsuarioId = req.body.UsuarioId
    const items = req.body.items

    if (OrigenId === DestinoId)
      return res.status(400).json({ error: 'Las sucursales no pueden ser iguales' })

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'Debe incluir al menos un producto' })

    for (const i of items) {
      const ProductoId = i.ProductoId
      const cantidad = i.cantidad
      const stockOrigen = await Stock.findOne({
        where: { SucursalId: OrigenId, ProductoId },
        transaction: t
      })
      if (!stockOrigen || stockOrigen.existencias < cantidad) {
        await t.rollback()
        return res.status(400).json({
          error: `Stock insuficiente del producto ${ProductoId} en la sucursal ${OrigenId}`
        })
      }
    }

    const traslado = await Traslado.create(
      {
        OrigenId,
        DestinoId,
        UsuarioId,
        fecha: new Date(),
        estado: 'COMPLETADO'
      },
      { transaction: t }
    )

    for (const i of items) {
      const ProductoId = i.ProductoId
      const cantidad = i.cantidad
      const stockOrigen = await Stock.findOne({
        where: { SucursalId: OrigenId, ProductoId },
        transaction: t
      })
      stockOrigen.existencias -= cantidad
      await stockOrigen.save({ transaction: t })

      const stockDestino = await Stock.findOne({
        where: { SucursalId: DestinoId, ProductoId },
        transaction: t
      })

      if (stockDestino) {
        stockDestino.existencias += cantidad
        await stockDestino.save({ transaction: t })
      } else {
        await Stock.create(
          { SucursalId: DestinoId, ProductoId, existencias: cantidad },
          { transaction: t }
        )
      }

      await TrasladoItem.create(
        { TrasladoId: traslado.TrasladoId, ProductoId, cantidad },
        { transaction: t }
      )
    }

    await registrarLog(UsuarioId, 'Traslado', traslado.TrasladoId, 'CREAR', null, traslado)
    await t.commit()
    res.status(201).json(traslado)
  } catch (error) {
    console.error('Error detallado en createTraslado:')
    console.error(error.message)
    console.error(error.stack)
    await t.rollback()
    res.status(500).json({ message: 'Error al crear traslado' })
  }
}
