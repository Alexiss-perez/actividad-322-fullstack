const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    id_externo: { type: Number, required: true, unique: true }, // ID original de Shopify
    nombre: { type: String, required: true },
    precio_regular: { type: Number, required: true },
    precio_oferta: { type: Number, default: null },
    variantes: [{ type: String }], // Array de tonos o tamaños
    url_imagen: { type: String },
    stock_disponible: { type: Boolean, default: true }
}, { timestamps: true }); // Guarda automáticamente la fecha de creación y actualización

module.exports = mongoose.model('Producto', ProductoSchema);