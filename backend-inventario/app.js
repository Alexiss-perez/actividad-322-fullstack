require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db.js');
const ejecutarScraping = require('./services/scrapingService.js');
const productoRoutes = require('./routes/productoRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const pedidoRoutes = require('./routes/pedidoRoutes.js'); // <- 1. Importación verificada
const Usuario = require('./models/Usuario.js'); 

const app = express();

// Conectar a la Base de Datos
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoints del Microservicio
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes); // <- 2. Middleware de ruta verificado

// Ruta de prueba base
app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor de eCommerce-X operando correctamente" });
});

// Función para asegurar la existencia de un Administrador de pruebas
const crearAdminPorDefecto = async () => {
    try {
        const adminExiste = await Usuario.findOne({ rol: 'admin' });
        if (!adminExiste) {
            const nuevoAdmin = new Usuario({
                nombre: "Administrador General",
                email: "admin@ecommerce.cl",
                password: "admin123456_security", 
                rol: "admin"
            });
            await nuevoAdmin.save();
            console.log("🛡️ [CONFIG] Cuenta de Administrador por defecto creada con éxito: admin@ecommerce.cl");
        } else {
            console.log("🛡️ [CONFIG] Cuenta de Administrador ya presente en la base de datos.");
        }
    } catch (error) {
        console.error("❌ Error al inicializar el administrador por defecto:", error.message);
    }
};

// Configuración del puerto y encendido
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    await crearAdminPorDefecto(); 
    await ejecutarScraping();
});