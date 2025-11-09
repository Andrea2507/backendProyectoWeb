const { QueryTypes } = require('sequelize')
const db = require('../db/db')
const { registrarLog } = require('../middlewares/log.middleware')

exports.top100Productos = async (req, res) => {
  try {
    const { sucursalId } = req.query
    const filtro = sucursalId ? `AND v.SucursalId = ${sucursalId}` : ''
    const datos = await db.query(`
      SELECT 
        p.ProductoId,
        p.nombre,
        SUM(vi.cantidad) AS total_vendido,
        COALESCE(su.nombre, 'General') AS sucursal
      FROM ventaitem vi
      JOIN producto p ON p.ProductoId = vi.ProductoId
      JOIN venta v ON v.VentaId = vi.VentaId
      LEFT JOIN sucursal su ON su.SucursalId = v.SucursalId
      WHERE v.estado IN ('PAGADA', 'ESPERANDO_PAGO') ${filtro}
      GROUP BY p.ProductoId, p.nombre, su.nombre
      ORDER BY total_vendido DESC
      LIMIT 100
    `, { type: QueryTypes.SELECT })
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Top 100 productos', sucursalId })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener top productos' })
  }
}

exports.productosBajoStock = async (req, res) => {
  try {
    const datos = await db.query(`
      SELECT 
        s.SucursalId,
        su.nombre AS sucursal,
        p.ProductoId,
        p.nombre,
        s.existencias
      FROM stock s
      JOIN producto p ON p.ProductoId = s.ProductoId
      JOIN sucursal su ON su.SucursalId = s.SucursalId
      WHERE s.existencias < 10
      ORDER BY s.existencias ASC
      LIMIT 20
    `, { type: QueryTypes.SELECT }) //ejecutar sql
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Productos bajo stock' })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener productos con bajo stock' })
  }
}

exports.productosMasVendidosPorMes = async (req, res) => {
  try {
    const datos = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM v.fecha) AS mes,
        p.ProductoId,
        p.nombre AS producto,
        SUM(vi.cantidad) AS cantidad
      FROM ventaitem vi
      JOIN venta v ON v.VentaId = vi.VentaId
      JOIN producto p ON p.ProductoId = vi.ProductoId
      WHERE v.estado IN ('PAGADA', 'ESPERANDO_PAGO')
      GROUP BY mes, p.ProductoId, p.nombre
      ORDER BY mes ASC, cantidad DESC
    `, { type: QueryTypes.SELECT })
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Productos más vendidos por mes' })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener productos más vendidos por mes' })
  }
}

exports.reporteProductosMesSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.query
    const filtro = sucursalId ? `AND v.SucursalId = ${sucursalId}` : ''
    const datos = await db.query(`
      SELECT 
        s.nombre AS sucursal,
        EXTRACT(MONTH FROM v.fecha) AS mes,
        p.nombre AS producto,
        SUM(vi.cantidad) AS cantidad
      FROM ventaitem vi
      JOIN venta v ON v.VentaId = vi.VentaId
      JOIN producto p ON p.ProductoId = vi.ProductoId
      JOIN sucursal s ON s.SucursalId = v.SucursalId
      WHERE v.estado IN ('PAGADA', 'ESPERANDO_PAGO') ${filtro}
      GROUP BY s.nombre, mes, p.nombre
      ORDER BY mes ASC, cantidad DESC
    `, { type: QueryTypes.SELECT })
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Productos por mes y sucursal', sucursalId })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener reporte de productos por mes y sucursal' })
  }
}

exports.clientesFrecuentes = async (req, res) => {
  try {
    const { sucursalId } = req.query
    const filtro = sucursalId ? `AND v.SucursalId = ${sucursalId}` : ''
    const datos = await db.query(`
      SELECT 
        c.nombre AS nombreCliente,
        c.correo AS correoCliente,
        COUNT(v.VentaId) AS compras_realizadas,
        SUM(v.total) AS total_gastado
    FROM cliente c
    LEFT JOIN venta v 
        ON v.ClienteId = c.ClienteId
    GROUP BY c.ClienteId
    ORDER BY total_gastado DESC;

    `, { type: QueryTypes.SELECT })
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Clientes frecuentes', sucursalId })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener clientes frecuentes' })
  }
}

exports.ventasPorRango = async (req, res) => {
  try {
    const { inicio, fin, sucursalId } = req.query
    if (!inicio || !fin) return res.status(400).json({ message: 'Debe enviar inicio y fin' })
    //para ordenarlas por sucursal
      const filtro = sucursalId ? `AND v.SucursalId = ${sucursalId}` : ''
    const datos = await db.query(`
      SELECT 
        v.VentaId,
        v.fecha,
        v.total,
        s.nombre AS sucursal,
        v.nombreCliente,
        v.estado
      FROM venta v
      JOIN sucursal s ON s.SucursalId = v.SucursalId
      WHERE v.fecha BETWEEN :inicio AND :fin ${filtro}
      ORDER BY v.fecha ASC
    `, { replacements: { inicio, fin }, type: QueryTypes.SELECT })
    await registrarLog(req.user?.id, 'Reporte', null, 'GENERAR', null, { reporte: 'Ventas por rango', inicio, fin, sucursalId })
    res.status(200).json(datos)
  } catch (e) {
    res.status(500).json({ error: e, message: 'Error al obtener ventas por rango' })
  }
}
