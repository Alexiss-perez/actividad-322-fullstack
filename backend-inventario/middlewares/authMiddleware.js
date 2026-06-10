const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario está logueado (Token válido)
const verificarToken = (req, res, next) => {
    // Capturar el token desde los encabezados HTTP (Authorization)
    const token = req.header('Authorization')?.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // Verificar el token con la clave secreta
        const cifrado = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_super_segura');
        req.usuario = cifrado; // Guardamos los datos del usuario en la petición (id, rol)
        next(); // Permitir pasar a la ruta
    } catch (error) {
        res.status(400).json({ mensaje: 'Token no válido o expirado.' });
    }
};

// Middleware para restringir accesos solo a Administradores (Rúbrica de roles)
const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
};

module.exports = { verificarToken, esAdmin };