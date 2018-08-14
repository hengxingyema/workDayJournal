var express = require('express');
var router = express.Router();
var AV = require('leanengine');

var logSqlUtil = require('../mimaBike/logSqlUtil');

router.get('/', function (req, res) {
    res.render('bikeTrack');
})

router.get('/:prams', function (req, res) {
    res.render('bikeTrack');
})


module.exports = router;