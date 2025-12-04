var express = require('express');
var router = express.Router();
var session = require('../../session'); // Добавить импорт

router.get('/', async function(req, res, next) {
    // Проверка прав доступа (только админ)
    const user = session.auth(req).user;
    if (!user || user.id_role !== 1) {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    try {
        let users = await req.db.any(`
            SELECT
                users.id AS id,
                users.login AS login,
                users.fio AS fio,
                roles.label AS role_label
            FROM
                users
            INNER JOIN roles ON roles.id = users.id_role
            WHERE users.is_blocked = 0
            ORDER BY users.id
        `);
        res.json({users: users });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;