const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conectarDB = require('./config/db.js');
const ejecutarScraping = require('./services/scrapingService.js'); // Importar Scraping
const productoRoutes = require('./routes/productoRoutes.js'); // Importar Rutas

const app = express();

// Conectar a la Base de Datos
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Vincular Rutas Propias del Microservicio
app.use('/api/productos', productoRoutes);

// Ruta de prueba base
app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor de eCommerce-X operando correctamente" });
});

// Configuración del puerto y encendido
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    
    // Ejecutar scraping de forma asíncrona automáticamente al iniciar el microservicio
    await ejecutarScraping();
});