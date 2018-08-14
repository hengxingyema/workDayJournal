var app = angular.module('bikeTrackApp',[

]);

app.controller('bikeTrackCtrl', function ($scope, $http, $location) {

    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("?");//取得?号的位置
    $scope.point = decodeURI(loc.substr(n2+1, n1-n2));//从?号后面的内容

    console.log('能打印吗？', $scope.point);


})