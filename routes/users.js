var express = require('express');
var router = express.Router();
var session = require('../session');
const md5 = require('md5');

// Список пользователей
router.get('/', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    res.render('users/list', { 
        title: 'Пользователи',
        user: user 
    });
});

// Создать пользователя
router.post('/create', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    // Проверка уникальности логина
    const existingUser = await req.db.oneOrNone(
        'SELECT id FROM users WHERE login = $1', 
        [req.body.login]
    );
    
    if (existingUser) {
        return res.status(400).send('Такой логин уже существует');
    }

    await req.db.none(
        'INSERT INTO users(login, pass, fio, id_role, is_blocked) VALUES($1,$2,$3,$4,$5)',
        [req.body.login, md5(req.body.pass), req.body.fio, req.body.id_role, 0]
    );
    res.redirect('/users');
});

// Редактировать пользователя
router.post('/edit/:id', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    try {
        // Преобразуем id_role в число или null
        const idRole = req.body.id_role ? parseInt(req.body.id_role) : null;
        
        // Если id_role не число - используем текущее значение
        const idRoleValue = (idRole && [1, 2, 3].includes(idRole)) ? idRole : null;
        
        await req.db.none(
            `UPDATE users SET 
                login = COALESCE($1, login),
                fio = COALESCE($2, fio),
                id_role = COALESCE($3, id_role)
             WHERE id = $4`,
            [
                req.body.login || null,
                req.body.fio || null,
                idRoleValue,
                req.params.id
            ]
        );
        
        res.redirect('/users');
        
    } catch (error) {
        console.error('Ошибка редактирования:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Смена пароля пользователя
router.post('/changepass/:id', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    try {
        if (req.body.pass && req.body.pass.trim() !== '') {
            await req.db.none(
                'UPDATE users SET pass = $1 WHERE id = $2',
                [md5(req.body.pass.trim()), req.params.id]
            );
        }
        
        res.redirect('/users');
        
    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Удалить пользователя
router.post('/delete/:id', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    await req.db.none('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.redirect('/users');
});

module.exports = router;