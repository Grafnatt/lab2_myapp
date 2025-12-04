const md5 = require('md5');
const crypto = require('crypto');

exports.sessions = {};

exports.login = async function(req, login, pass) {
    var cookies = req.cookies || {};
    var user = await req.db.oneOrNone('SELECT * FROM users WHERE login = $1', login);

    if (user && user.pass === md5(pass)) {
        var secretKey = 'secret';
        var hash = crypto.createHmac('sha256', secretKey)
                         .update(login)
                         .digest('hex');

        var cookie = login + '--' + hash;
        exports.sessions[login] = {
            active: 1,
            timestamp: Date.now(),
            user: user
        };
        return cookie;
    }
    return 0;
};

exports.auth = function(req) {
    var cookies = req.cookies || {};
    var cookieValue = cookies['app_user'];
    
    if (!cookieValue) return {};

    var res = cookieValue.split('--');
    if (!res.length) return {};

    var session = exports.sessions[res[0]];
    if (!session) return {};

    if (!session.active || (Date.now() - session.timestamp) > 43200*1000) {
        return {};
    }

    return session;
};

// ВАЖНО: функция проверки прав (для задания 7)
exports.can = function(user) {
    let res = {};

    res.view_users = user && user.id_role == 1 ? true : false;      // только админ
    res.view_payments = user && user.id_role <= 2 ? true : false;   // админ + руководитель
    res.view_orders = user && user.id_role <= 3 ? true : false;     // все
    res.view_clients = user && user.id_role <= 2 ? true : false;    // админ + руководитель

    return res;
};

exports.logout = function(login) {
    delete exports.sessions[login]; 
};