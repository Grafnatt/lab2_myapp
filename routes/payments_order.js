var express = require('express');
var router = express.Router();
var session = require('../session');

// Оплаты конкретного заказа
router.get('/:orderId', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || user.id_role > 2) {  // только admin и manager
        return res.status(403).send('Доступ запрещен');
    }

    const orderId = parseInt(req.params.orderId);
    
    try {
        // Получить информацию о заказе
        const order = await req.db.oneOrNone(
            'SELECT id, label FROM orders WHERE id = $1', 
            [orderId]
        );
        
        if (!order) {
            return res.status(404).send("Заказ не найден");
        }

        // Получить платежи по заказу
        const payments = await req.db.any(`
            SELECT p.*, pt.label as payment_type_label
            FROM payments p
            LEFT JOIN payment_types pt ON p.id_payment_type = pt.id
            WHERE p.id_order = $1
        `, [orderId]);

        // Получить типы платежей для формы
        const paymentTypes = await req.db.any('SELECT * FROM payment_types');

        res.render('payments/order', {
            title: `Оплаты заказа: ${order.label}`,
            order: order,
            payments: payments,
            paymentTypes: paymentTypes,
            user: user
        });

    } catch (error) {
        console.error('Ошибка загрузки платежей:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавить оплату
router.post('/:orderId/add', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || user.id_role > 2) {
        return res.status(403).send('Доступ запрещен');
    }

    const orderId = parseInt(req.params.orderId);
    const { id_payment_type, amount } = req.body;

    const amountNum = parseFloat(amount);
    
    try {
        await req.db.none(
            'INSERT INTO payments(id_order, id_payment_type, amount) VALUES($1, $2, $3)',
            [orderId, id_payment_type, amountNum]
        );
        
        res.redirect(`/payments/${orderId}`);
    } catch (error) {
        console.error('Ошибка добавления оплаты:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;