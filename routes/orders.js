var express = require('express');
var router = express.Router();
var session = require('../session');

// Список заказов
router.get('/', async function(req, res) {
    const user = session.auth(req).user;
    if (!user) return res.status(403).send('Доступ запрещён');

    // Определяем права
    const can_create_order = user.id_role === 1 || user.id_role === 3; // admin или employee
    const can_change_status = user.id_role === 1 || user.id_role === 2; // admin или manager
    const can_make_payment = user.id_role === 1 || user.id_role === 2; // admin или manager

    try {
        const orders = await req.db.any(`
            SELECT o.id, o.label, o.amount, o.id_status, s.label AS status_label, c.label AS client_label
            FROM orders o
            LEFT JOIN order_statuses s ON o.id_status = s.id
            LEFT JOIN clients c ON o.id_client = c.id
        `);
            const clients = await req.db.any('SELECT id, label FROM clients');
        res.render('orders/index', {
            orders,
            clients,
            user,
            can_create_order,
            can_change_status,
            can_make_payment
        });
    } catch(err) {
        res.status(500).send('Ошибка загрузки заказов');
    }
});

// Форма создания заказа
router.get('/create', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || (user.id_role !== 1 && user.id_role !== 3)) {
        return res.status(403).send('Доступ запрещён');
    }

    const clients = await req.db.any('SELECT id, label FROM clients');
    res.render('orders/create', { clients });
});

// Создание заказа
router.get('/create', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || (user.id_role !== 1 && user.id_role !== 3)) {
        return res.status(403).send('Доступ запрещён');
    }

    try {
        const clients = await req.db.any('SELECT id, label FROM clients');
        res.render('orders/create', { user, clients });
    } catch(err) {
        res.status(500).send('Ошибка получения клиентов');
    }
});

router.post('/create', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || (user.id_role !== 1 && user.id_role !== 3)) {
        return res.json({ success: false, msg: 'Доступ запрещён' });
    }

    const { label, id_client, amount } = req.body;

    if(!label || !id_client || !amount) {
        return res.json({ success: false, msg: 'Заполните все поля' });
    }

    try {
        await req.db.none(
            'INSERT INTO orders(label, id_client, amount) VALUES($1, $2, $3)',
            [label, parseInt(id_client), parseFloat(amount).toFixed(2)]
        );
        res.json({ success: true });
    } catch(err) {
        res.json({ success: false, msg: 'Ошибка создания заказа' });
    }
});

// Просмотр одного заказа
router.get('/:id', async function(req, res) {

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send("Неверный ID");
    }

    try {
        const order = await req.db.one(
            `SELECT o.id, o.label, o.amount, s.label AS status_label, c.label AS client_label
             FROM orders o
             LEFT JOIN order_statuses s ON o.id_status = s.id
             LEFT JOIN clients c ON o.id_client = c.id
             WHERE o.id = $1`,
            [id]
        );

        res.render('orders/show', { order });

    } catch (err) {
        res.status(404).send("Заказ не найден");
    }
});




// Изменение статуса заказа (только manager и admin)
router.post('/:id/status', async function(req, res) {
    const user = session.auth(req).user;
    if (!user || (user.id_role !== 1 && user.id_role !== 2)) {
        return res.status(403).send('Доступ запрещён');
    }

    const id = parseInt(req.params.id);
    const { id_status } = req.body;

    try {
        await req.db.none('UPDATE orders SET id_status=$1 WHERE id=$2', [id_status, id]);
        res.redirect(`/orders/${id}`);
    } catch(err) {
        res.status(500).send('Ошибка изменения статуса');
    }
});


module.exports = router;
