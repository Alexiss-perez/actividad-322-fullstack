const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const ejecutarScraping = require('../services/scrapingService');

// Endpoint 1: Obtener todos los productos guardados localmente en MongoDB
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos del inventario.' });
    }
});

// Endpoint 2: Trigger manual para forzar la actualización del scraping desde el Frontend o Postman
router.post('/sincronizar', async (req, res) => {
    await ejecutarScraping();
    res.json({ mensaje: 'Proceso de sincronización disparado.' });
});

module.exports = router;