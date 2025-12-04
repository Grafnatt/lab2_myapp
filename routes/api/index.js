var express = require('express');
var router = express.Router();

var auth = require('./auth');
var users = require('./users');  // ДОБАВИТЬ

router.use('/auth', auth);
router.use('/users', users);  // ДОБАВИТЬ

module.exports = router;