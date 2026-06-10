    const axios = require('axios');
const Producto = require('../models/Producto');

const ejecutarScraping = async () => {
    try {
        console.log('🤖 Iniciando Web Scraping desde Shopify (okwu.cl)...');
        const url = 'https://okwu.cl/collections/labiales/products.json';
        
        // Petición HTTP externa
        const respuesta = await axios.get(url);
        const productosExternos = respuesta.data.products;

        if (!productosExternos || productosExternos.length === 0) {
            console.log('⚠️ La fuente externa no retornó productos.');
            return;
        }

        // Recorrer los productos obtenidos para normalizarlos
        for (let prod of productosExternos) {
            // Shopify guarda las variantes (tonos/tamaños) en un array. Usamos la primera por defecto.
            const primeraVariante = prod.variants[0];
            
            // Lógica para separar precio regular y de oferta
            const precioRegular = parseFloat(primeraVariante.compare_at_price || primeraVariante.price);
            const precioOferta = primeraVariante.compare_at_price ? parseFloat(primeraVariante.price) : null;

            // Mapeo y Normalización de campos solicitados en la guía
            const productoNormalizado = {
                id_externo: prod.id,
                nombre: prod.title,
                precio_regular: precioRegular,
                precio_oferta: precioOferta,
                variantes: prod.variants.map(v => v.title), // Array de tonos/variantes disponibles
                url_imagen: prod.images[0]?.src || '', // Captura la primera imagen
                stock_disponible: primeraVariante.available // true o false según disponibilidad real
            };

            // Estrategia Upsert: Si el ID externo existe lo actualiza, si no, lo crea de cero
            await Producto.findOneAndUpdate(
                { id_externo: prod.id },
                productoNormalizado,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Catálogo e Inventario sincronizados y guardados en MongoDB con éxito.');

    } catch (error) {
        // REQUERIMIENTO NO FUNCIONAL: Disponibilidad y Resiliencia
        // Si se cae internet o falla Shopify, capturamos el error para que la API de eCommerce-X siga viva
        console.error('❌ Error en el módulo de scraping:', error.message);
        console.log('🛡️ El sistema operará de manera segura con el último caché disponible en la base de datos.');
    }
};

module.exports = ejecutarScraping;