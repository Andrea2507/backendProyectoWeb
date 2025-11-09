const express = require('express')
const router = express.Router()
const r = require('../controllers/reporte.controller')

router.get('/top100', r.top100Productos)
router.get('/bajo-stock', r.productosBajoStock)
router.get('/productos-mes', r.productosMasVendidosPorMes)
router.get('/productos-mes-sucursal', r.reporteProductosMesSucursal)
router.get('/clientes-frecuentes', r.clientesFrecuentes)
router.get('/ventas-rango', r.ventasPorRango)

module.exports = router
