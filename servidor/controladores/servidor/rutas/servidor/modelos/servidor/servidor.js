// servidor.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const rutasAutenticacion = require("../authRoute");
const rutasUsuario = require("../usuarioRuta");

dotenv.config();
const aplicacion = express();

aplicacion.use(cors());
aplicacion.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// Rutas
aplicacion.use("/api/auth", rutasAutenticacion);
aplicacion.use("/api/usuarios", rutasUsuario);

// Puerto
const PUERTO = process.env.PUERTO || 5000;
aplicacion.listen(PUERTO, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PUERTO}`);
});
