const express = require('express')
const router = express.Router()
const Cliente = require('../models/cliente.model')

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll()
    res.json(clientes)
  } catch (e) {
    res.status(500).json({ error: e.message, message: 'Error al obtener clientes' })
  }
})

module.exports = router
