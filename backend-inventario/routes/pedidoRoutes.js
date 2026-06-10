const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator'); // Importar validador

// Crear un nuevo pedido con validación de estructura
router.post('/', [
    verificarToken,
    body('productos', 'La lista de productos no puede estar vacía').isArray({ min: 1 }),
    body('total', 'El total del pedido debe ser un número positivo').isFloat({ min: 0 })
], async (req, res) => {

    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        const { productos, total } = req.body;
        const nuevoPedido = new Pedido({ 
            cliente: req.usuario.id, 
            productos, 
            total 
        });
        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar el pedido.' });
    }
});

// Obtener todos los pedidos (Solo Admin)
router.get('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate('cliente', 'nombre email').populate('productos.producto');
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos.' });
    }
});

module.exports = router;