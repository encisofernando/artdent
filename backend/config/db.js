const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', // Cambia esto si tu base de datos está en otro servidor
    user: 'root',      // Cambia esto si tu usuario es diferente
    password: '211436',// Cambia esto a tu contraseña
    database: 'movedb' // Nombre de tu base de datos
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos: ', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = db;
