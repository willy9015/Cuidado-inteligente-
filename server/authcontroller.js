// servidor/controladores/authController.js
const User = require('../modelos/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) return res.status(400).json({ mensaje: 'Usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = new User({ nombre, email, password: hash });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: 'No se encontró usuario' });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login' });
  }
};
