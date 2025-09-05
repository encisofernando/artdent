function authRole(rolesPermitidos) {
    return (req, res, next) => {
        const usuario = req.user; // El usuario debería estar previamente autenticado

        if (!usuario) {
            return res.status(403).json({ message: 'Acceso denegado: no autenticado' });
        }

        if (!rolesPermitidos.includes(usuario.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: no tienes el rol adecuado' });
        }

        next();
    };
}

module.exports = authRole;
