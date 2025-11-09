const PDFDocument = require('pdfkit')
const Cliente = require('../models/cliente.model')
const Cotizacion = require('../models/cotizacion.model')

exports.generarPDFCotizacion = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Content-Type', 'application/pdf')

    // importante en Railway
    res.removeHeader("Content-Encoding")

    const { nombre, correo, telefono, items } = req.body
    if (!nombre || !correo || !items || items.length === 0)
      return res.status(400).json({ message: 'Datos incompletos' })

    let cliente = await Cliente.findOne({ where: { correo } })
    if (!cliente) cliente = await Cliente.create({ nombre, correo, telefono })

    const cotizacion = await Cotizacion.create({ ClienteId: cliente.ClienteId })
    const numero = String(cotizacion.CotizacionId).padStart(4, '0')
    const fechaActual = new Date().toLocaleString('es-GT')

    const doc = new PDFDocument({ bufferPages: true })

    // cabecera
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cotizacion_${numero}.pdf"`
    )

    doc.pipe(res)

    doc.fontSize(22).text('Cotización', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Número: COT-${numero}`)
    doc.text(`Fecha: ${fechaActual}`)
    doc.moveDown()

    doc.text(`Cliente: ${cliente.nombre}`)
    doc.text(`Correo: ${cliente.correo}`)
    if (telefono) doc.text(`Teléfono: ${telefono}`)
    doc.moveDown()

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    let total = 0
    doc.fontSize(14).text('Productos:')
    doc.moveDown()

    items.forEach(i => {
      const precio = Number(i.precioUnit || i.precio || 0)
      const cantidad = Number(i.cantidad || 1)
      const nombreProd = i.nombre || 'Producto'
      const subtotal = precio * cantidad

      total += subtotal

      doc.fontSize(12).text(
        `${nombreProd} x${cantidad} - Q${precio.toFixed(2)} | Subtotal: Q${subtotal.toFixed(2)}`
      )
    })

    doc.moveDown(2)
    doc.fontSize(16).text(`Total: Q${total.toFixed(2)}`, { align: 'right' })

    doc.end()

  } catch (e) {
    console.error(e)
    if (!res.headersSent)
      res.status(500).json({ message: 'Error al generar PDF' })
  }
}
