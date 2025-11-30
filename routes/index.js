var express = require('express');
var router = express.Router();
var session = require('../session');

router.get('/', function(req, res, next) {

    var user = session.auth(req).user
    var can_view_users = user && user.id_role == 1 ? true : false
    var can_view_clients = true
    var can_view_orders = user && (user.id_role == 2 || user.id_role == 3 || user.id_role == 1)
    var can_view_order_items = user && (user.id_role == 3 || user.id_role == 1)
    var can_view_payments = user && (user.id_role == 2 || user.id_role == 1)

    res.render('index', {
        title:  "Главная страница",
        user:   user,
        can_view_users: can_view_users,
        can_view_clients: can_view_clients,
        can_view_orders: can_view_orders,
        can_view_order_items: can_view_order_items,
        can_view_payments: can_view_payments
    })


});

module.exports = router;