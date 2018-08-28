// 更换车辆sn号

var express = require('express');
var router = express.Router();
var AV = require('leanengine');

var redisUtil = require('../redis/leanObjectRedis');



router.get('/', function(req, res) {
    res.render('reEntryBikeSN');
});


module.exports = router;