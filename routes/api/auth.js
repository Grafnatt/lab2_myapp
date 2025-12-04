var express = require('express');
var router = express.Router();
var session = require('../../session');

router.post('/login', async function(req, res) {
    var cookie = await session.login(req, req.body.login, req.body.password)
    if (cookie) {
        res.cookie('app_user', cookie, { maxAge: 43200*1000, httpOnly: true, path: '/' });
        res.json({ msg: ''})
        return;
    }
    res.json({ msg: 'Неверный логин/пароль'})
});
router.post('/logout', function(req, res) {
    var user = session.auth(req)
    if (user && user.user) {  // проверяем, что user существует
        res.clearCookie('app_user', { path: '/' });
        session.logout(user.user.login)  // передаем логин
    }
    res.json({ msg: '' })
});
module.exports = router;
