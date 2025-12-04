var express = require('express');
var router = express.Router();
var session = require('../session');

//список клиентов
router.get('/', async function(req, res, next) {
    var userSession = session.auth(req);
    if (!userSession.user) return res.redirect('/');

    var clients = await req.db.any('SELECT * FROM clients');

    res.render('clients', {
        user: userSession.user,
        clients: clients
    });
});

//создание клиента
router.post('/create', async function(req, res, next) {
    var user = session.auth(req).user;
    if (!user || user.id_role > 2) {  // role > 2 = сотрудник (3)
    return res.status(403).send('Нет доступа');
    }
    await req.db.none('INSERT INTO clients(label) VALUES($1)', [req.body.label]);
    res.redirect('/clients');
});

//редактирование клиента
router.post('/edit/:id', async function(req, res, next) {
    var user = session.auth(req).user;
    if (!user || user.id_role > 2) {  // role > 2 = сотрудник (3)
    return res.status(403).send('Нет доступа');
    }
    await req.db.none('UPDATE clients SET label=$1 WHERE id=$2', [req.body.label, req.params.id]);
    res.redirect('/clients');
});

//удаление клиента
router.post('/delete/:id', async function(req, res, next) {
    var user = session.auth(req).user;
    if (!user || user.id_role > 2) {  // role > 2 = сотрудник (3)
    return res.status(403).send('Нет доступа');
    }
    await req.db.none('DELETE FROM clients WHERE id=$1', [req.params.id]);
    res.redirect('/clients');
});

module.exports = router;
