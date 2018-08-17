var express = require('express');
var router = express.Router();
var AV = require('leanengine');

router.get('/', function (req, res) {
    res.render('bikeTrack');
})

module.exports = router;