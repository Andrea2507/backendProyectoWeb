const sequelize = require('../db/db')
const Venta = require('../models/venta.model')
const VentaItem = require('../models/ventaitem.model')
const Producto = require('../models/producto.model')
const Stock = require('../models/stock.model')
const Cliente = require('../models/cliente.model')
const { registrarLog } = require('../middlewares/log.middleware')

exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: {
        model: VentaItem,
        as: 'items',
        include: {
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'precio']
        }
      }
    })
    res.status(200).json(ventas)
  } catch (e) {
    console.error('Error al obtener ventas:', e)
    res.status(500).json({ error: e.message, message: 'Error al obtener ventas' })
  }
}

exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: {
        model: VentaItem,
        as: 'items',
        include: {
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'precio']
        }
      }
    })
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' })
    res.status(200).json(venta)
  } catch (e) {
    console.error('Error al obtener venta por ID:', e)
    res.status(500).json({ error: e.message, message: 'Error al obtener venta' })
  }
}

exports.createVenta = async (req, res) => {
  const t = await sequelize.transaction()

  try {
    const {
      SucursalId,
      UsuarioId,
      nota,
      items,
      nombreCliente,
      correoCliente,
      direccionCliente,
      telefonoCliente,
      metodoPago
    } = req.body

    console.log('Datos recibidos en /ventas:', req.body)

    if (!SucursalId) {
      await t.rollback()
      return res.status(400).json({ message: 'Debe indicar la sucursal de la venta' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback()
      return res.status(400).json({ message: 'Debe incluir al menos un producto en la venta' })
    }

    if (!metodoPago || !['TARJETA', 'CONTRA_ENTREGA'].includes(metodoPago)) {
      await t.rollback()
      return res.status(400).json({ message: 'Debe especificar un método de pago válido' })
    }

    for (const it of items) {
      if (!it.ProductoId || !it.cantidad || !it.precioUnit) {
        await t.rollback()
        return res.status(400).json({ message: 'Producto del carrito con datos incompletos' })
      }
    }

    const total = items.reduce(
      (acc, it) => acc + Number(it.precioUnit) * Number(it.cantidad),
      0
    )

    const estadoFinal = metodoPago === 'TARJETA' ? 'PAGADA' : 'ESPERANDO_PAGO'

    // ✅ Buscar cliente por correo o crearlo
    let clienteFinal = null

    if (correoCliente) {
      clienteFinal = await Cliente.findOne({ where: { correo: correoCliente } })

      // ✅ Si no existe, crearlo (NO actualizar si ya existe)
      if (!clienteFinal) {
        clienteFinal = await Cliente.create(
          {
            nombre: nombreCliente,
            correo: correoCliente,
            telefono: telefonoCliente
          },
          { transaction: t }
        )
        console.log('Cliente nuevo creado:', clienteFinal.ClienteId)
      }
    }

    // ✅ Crear venta
    const venta = await Venta.create(
      {
        ClienteId: clienteFinal ? clienteFinal.ClienteId : null,
        SucursalId,
        UsuarioId: UsuarioId || null,
        nota: nota || 'Compra en línea',
        total,
        estado: estadoFinal,
        metodoPago,
        fecha: new Date(),
        nombreCliente: nombreCliente || null,
        correoCliente: correoCliente || null,
        direccionCliente: direccionCliente || null,
        telefonoCliente: telefonoCliente || null
      },
      { transaction: t }
    )

    console.log('Venta creada con ID:', venta.VentaId)

    // ✅ Guardar items y actualizar stock
    for (const it of items) {
      const ProductoId = Number(it.ProductoId)
      const cantidad = Number(it.cantidad)
      const precioUnit = Number(it.precioUnit)

      await VentaItem.create(
        { VentaId: venta.VentaId, ProductoId, cantidad, precioUnit },
        { transaction: t }
      )

      const stock = await Stock.findOne({
        where: { SucursalId, ProductoId },
        transaction: t
      })

      if (stock) {
        stock.existencias = Math.max(0, Number(stock.existencias) - cantidad)
        await stock.save({ transaction: t })
      } else {
        await Stock.create(
          { SucursalId, ProductoId, existencias: 0 },
          { transaction: t }
        )
      }
    }

    await registrarLog(req.user?.id || null, 'Venta', venta.VentaId, 'CREAR', null, venta)

    await t.commit()
    res.status(201).json({ message: 'Venta creada con éxito', venta })
  } catch (e) {
    await t.rollback()
    console.error('Error al crear venta:', e)
    res.status(500).json({
      error: e.message,
      stack: e.stack,
      message: 'Error interno al registrar la venta.'
    })
  }
}
