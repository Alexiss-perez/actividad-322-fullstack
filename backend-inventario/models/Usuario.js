const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' }
}, { timestamps: true });

// Encriptar la contraseña automáticamente usando promesas modernas de async/await
UsuarioSchema.pre('save', async function() {
    // Si la contraseña no ha sido modificada, salir de la función
    if (!this.isModified('password')) return;
    
    // Encriptar de forma asíncrona sin usar la función "next"
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Usuario', UsuarioSchema);