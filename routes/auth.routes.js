const express = require('express')
const router = express.Router()
const c = require('../controllers/auth.controller')

router.post('/login', c.login)
router.post('/register', c.registrar)

module.exports = router
