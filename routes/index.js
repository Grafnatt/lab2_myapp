var express = require('express');
var router = express.Router();
var session = require('../session');

router.get('/', function(req, res, next) {
    var sessionData = session.auth(req);
    var user = sessionData.user;
    
    
    // Или вычисляем вручную (если нет функции can):
    var can_view_users = user && user.id_role == 1;
    var can_view_clients = user && user.id_role <= 3;  // админ + руководитель
    var can_view_orders = user && user.id_role <= 3;   // все авторизованные
    var can_view_payments = user && user.id_role <= 2;  // admin + manager
    res.render('index', {
        title: "Главная страница",
        user: user,
        can_view_users: can_view_users,
        can_view_clients: can_view_clients,
        can_view_orders: can_view_orders,
        can_view_payments: can_view_payments
    });
});

module.exports = router;