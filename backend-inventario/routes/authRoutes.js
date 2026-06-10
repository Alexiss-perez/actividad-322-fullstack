const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator'); // Importar validador

// Registrar un nuevo usuario con Validaciones Incrustadas
router.post('/register', [
    body('nombre', 'El nombre es obligatorio y debe ser texto').not().isEmpty().trim(),
    body('email', 'Por favor introduce un email válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
    
    // Revisar si express-validator atrapó algún error
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        const { nombre, email, password, rol } = req.body;
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ mensaje: 'El usuario ya existe' });

        usuario = new Usuario({ nombre, email, password, rol });
        await usuario.save();

        res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
});

// Login de usuario
router.post('/login', [
    body('email', 'Introduce un email válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña es obligatoria').not().isEmpty()
], async (req, res) => {
    
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
            { expiresIn: '2h' }
        );

        res.json({ token, usuario: { nombre: usuario.nombre, rol: usuario.rol, email: usuario.email } });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor durante el login' });
    }
});

module.exports = router;