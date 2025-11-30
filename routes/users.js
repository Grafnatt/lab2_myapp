var express = require('express');
var router = express.Router();
var session = require('../session');
const md5 = require('md5');

//список пользователей
router.get('/', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    var users = await req.db.any('SELECT u.id, u.login, u.fio, u.id_role, r.label AS role_label FROM users u JOIN roles r ON u.id_role=r.id');
    var roles = await req.db.any('SELECT * FROM roles');

    res.render('users', { user, users, roles });
});

//создать пользователя
router.post('/create', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    await req.db.none(
        'INSERT INTO users(login, pass, fio, id_role, is_blocked) VALUES($1,$2,$3,$4,$5)',
        [req.body.login, md5(req.body.pass), req.body.fio, req.body.id_role, 0]
    );
    res.redirect('/users');
});

//редактировать пользователя
router.post('/edit/:id', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    if (req.body.pass) {
        await req.db.none(
            'UPDATE users SET login=$1, pass=$2, fio=$3, id_role=$4 WHERE id=$5',
            [req.body.login, md5(req.body.pass), req.body.fio, req.body.id_role, req.params.id]
        );
    } else {
        await req.db.none(
            'UPDATE users SET login=$1, fio=$2, id_role=$3 WHERE id=$4',
            [req.body.login, req.body.fio, req.body.id_role, req.params.id]
        );
    }

    res.redirect('/users');
});

//удалить пользователя
router.post('/delete/:id', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 1) return res.status(403).send('Нет доступа');

    await req.db.none('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.redirect('/users');
});

module.exports = router;