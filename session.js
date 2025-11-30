const md5 = require('md5');
const crypto = require('crypto');

exports.sessions = {};

exports.login = async function(req, login, pass) {
    var cookies = req.cookies || {};
    var user = await req.db.oneOrNone('SELECT * FROM users WHERE login = $1', login);

    if (user && user.pass === md5(pass)) {
        var cookieSecret = 'secret';
        var hash = crypto.createHmac('sha256', cookieSecret)
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
    var secret = cookies['app_user'];
    if (!secret) return {};

    var res = secret.split('--');
    if (!res.length) return {};

    var session = exports.sessions[res[0]];
    if (!session) return {};

    if (!session.active || (Date.now() - session.timestamp) > 43200*1000) {
        return {};
    }

    return session;
};

exports.logout = function(login) {
    exports.sessions[login] = {};
};