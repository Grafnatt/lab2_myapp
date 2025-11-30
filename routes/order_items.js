var express = require('express');
var router = express.Router();
var session = require('../session');

// список элементов заказа
router.get('/:orderId', async (req, res) => {
    var userSession = session.auth(req);
    if (!userSession.user) return res.redirect('/');

    var items = await req.db.any('SELECT * FROM order_items WHERE id_order=$1', [req.params.orderId]);
    res.render('order_items', { user: userSession.user, items, orderId: req.params.orderId });
});

// добавление элемента (employee)
router.post('/add/:orderId', async (req, res) => {
    var user = session.auth(req).user;
    if (!user || user.id_role != 3) return res.status(403).send('Нет доступа');

    await req.db.none('INSERT INTO order_items(label, id_order, amount) VALUES($1,$2,$3)',
        [req.body.label, req.params.orderId, req.body.amount]);
    res.redirect('/order_items/' + req.params.orderId);
});

module.exports = router;