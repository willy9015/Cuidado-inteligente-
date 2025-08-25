const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/usuarioControlador');

// Ruta para registro
router.post('/registro', usuarioControlador.registrarUsuario);

// Ruta para login
router.post('/login', usuarioControlador.loginUsuario);

module.exports = router;
