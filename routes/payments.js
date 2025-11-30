var express = require('express');
var router = express.Router();
var session = require('../session');

//список оплат
router.get('/:orderId', async (req, res) => {
    var userSession = session.auth(req);
    if (!userSession.user) return res.redirect('/');

    var payments = await req.db.any('SELECT * FROM payments WHERE id_order=$1', [req.params.orderId]);
    var types = await req.db.any('SELECT * FROM payment_types');

    res.render('payments', { user: userSession.user, payments, types, orderId: req.params.orderId });
});

//добавить оплату (manager)
router.post('/add/:orderId', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 2) return res.status(403).send('Нет доступа');

    await req.db.none('INSERT INTO payments(id_order, id_payment_type, amount) VALUES($1,$2,$3)',
        [req.params.orderId, req.body.id_payment_type, req.body.amount]);
    res.redirect('/payments/' + req.params.orderId);
});

module.exports = router;
