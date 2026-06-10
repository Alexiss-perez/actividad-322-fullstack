const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        // Si por alguna razón la variable de entorno viene vacía (undefined),
        // usamos la dirección local de respaldo por defecto.
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_x';
        
        await mongoose.connect(mongoURI);
        console.log(' Conexión exitosa a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        process.exit(1); 
    }
};

module.exports = conectarDB;