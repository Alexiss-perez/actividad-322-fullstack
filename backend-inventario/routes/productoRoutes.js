const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const ejecutarScraping = require('../services/scrapingService');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware'); // Guardia de seguridad
const { body, validationResult } = require('express-validator'); // Validador de consistencia

// ==========================================
// 1. OBTENER TODOS LOS PRODUCTOS (PÚBLICO)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos del inventario.' });
    }
});

// ==========================================
// 2. CREAR UN PRODUCTO MANUALMENTE (SOLO ADMIN)
// ==========================================
router.post('/', [
    verificarToken,
    esAdmin,
    body('nombre', 'El nombre es obligatorio').not().isEmpty().trim(),
    body('precio_regular', 'El precio debe ser un número positivo').isFloat({ min: 0 })
], async (req, res) => {
    
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        // Generamos un ID simulado único para que no choque con los de Shopify
        const id_externo_manual = 'MANUAL_' + Date.now();
        
        const nuevoProducto = new Producto({
            id_externo: id_externo_manual,
            nombre: req.body.nombre,
            precio_regular: req.body.precio_regular,
            precio_oferta: req.body.precio_oferta || null,
            variantes: req.body.variantes || ['Estándar'],
            url_imagen: req.body.url_imagen || 'https://via.placeholder.com/200',
            stock_disponible: req.body.stock_disponible !== undefined ? req.body.stock_disponible : true
        });

        await nuevoProducto.save();
        res.status(201).json({ mensaje: 'Producto creado manualmente con éxito', producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el producto.', error: error.message });
    }
});

// ==========================================
// 3. ACTUALIZAR UN PRODUCTO / STOCK (SOLO ADMIN)
// ==========================================
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // {new: true} devuelve el objeto ya cambiado
        );

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        res.json({ mensaje: 'Producto actualizado correctamente', producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
    }
});

// ==========================================
// 4. ELIMINAR UN PRODUCTO DEL INVENTARIO (SOLO ADMIN)
// ==========================================
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);

        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        res.json({ mensaje: 'Producto removido del inventario con éxito.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
    }
});

// ==========================================
// 5. DISPARAR SCRAPING MANUAL (SOLO ADMIN)
// ==========================================
router.post('/sincronizar', verificarToken, esAdmin, async (req, res) => {
    await ejecutarScraping();
    res.json({ mensaje: 'Proceso de sincronización forzada ejecutado por el Administrador.' });
});

module.exports = router;