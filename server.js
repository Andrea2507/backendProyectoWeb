require('dotenv').config()
const express = require('express')
const sequelize = require('./db/db.js')

const app = express()
app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente')
})

// Probar conexión a la BD
sequelize.authenticate()
  .then(() => console.log('Conectado a Railway MySQL correctamente'))
  .catch(err => console.error('Error al conectar a la BD:', err))

// Puerto (Railway usa process.env.PORT)
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(` Servidor iniciado en el puerto ${PORT}`)
})
