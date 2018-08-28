var app = angular.module('reEntryBikeSnApp',['Encrypt'])

app.controller('reEntryBikeSnCtrl', function ($scope,$http,Md5,Base64,Sha1) {

    $scope.timestamp = new Date().getTime();

    $scope.mimacxSign = Md5.hex_md5($scope.timestamp + '98klFJ=UX!878_XX8fk')

    $scope.yunweiAccountSession = undefined;
    $scope.yunWeiLogin = function () {

        $scope.netRequestState = 'start';
        $scope.netRequestState = 'start';
        $http.post("http://yw.mimacx.com:2000/Peration/Login",{
            "UserName" : $scope.mimaYunweiAccount,
            "UserPass" : $scope.yunWeiPassWord,
            "mimacxtimeSpan" : $scope.timestamp,
            "mimacxSign" : $scope.mimacxSign
        })
        .then(function(result) {
            var response = result.data;
            if(response.returnCode == '1'){
                $scope.yunweiAccountSession = response.Data.SessionKey;
                $scope.mimaYunweiLoginInfo = '登录成功:' + response.Data.LoginName;

            }else {
                //error
                $scope.mimaYunweiLoginInfo = response.returnMsg;
            }
        })
    };

    $scope.reEntryBike = function () {
        if ($scope.yunweiAccountSession != undefined){
            $http.post("http://yw.mimacx.com:2000/Operations/UpdateSystemNo",{
                "SessionKey": $scope.yunweiAccountSession,
                "mimacxtimeSpan" : $scope.timestamp,
                "mimacxSign" : $scope.mimacxSign,
                "BicycleNo" : $scope.bikeNumber,
                "SystemNo" : 'mimacx' + $scope.bikeSnNumber
            })
            .then(function(result) {
                var response = result.data;
                if(response.returnCode == '200'){
                    $scope.reEntryBikeInfo = '更新成功'

                }else {
                    //error
                    $scope.reEntryBikeInfo = response.returnMsg;
                }
            })
        }else {
            $scope.reEntryBikeInfo = '请先登录运维账号';
        }
    }
    
})