var app = angular.module('reEntryBikeSnApp',['Encrypt'])

app.controller('reEntryBikeSnCtrl', function ($scope,$http,Md5,Base64,Sha1) {

    $scope.timestamp = new Date().getTime();

    $scope.mimacxSign = Md5.hex_md5($scope.timestamp + '98klFJ=UX!878_XX8fk')

    $scope.yunweiAccountSession = undefined;
    $scope.yunWeiLogin = function () {

        $scope.netRequestState = 'start';
        $http.post("http://yw.mimacx.com:2000/Peration/Login", {
            
            "UserName" : $scope.mimaYunweiAccount,
            "UserPass" : $scope.mimaYunweiMima,
            "mimacxtimeSpan" : $scope.timestamp,
            "mimacxSign" : $scope.mimacxSign,
        })
            .then(function(result) {
                var response = result.data;
                if(response.returnCode == 1){
                    $scope.yunweiAccountSession = response.Data.SessionKey;
                    $scope.mimaYunweiLoginInfo = '登录成功:' + response.Data.LoginName;

                    getAllOperationArea();
                }else {
                    //error
                    $scope.mimaYunweiLoginInfo = response.returnMsg;
                }
                $scope.netRequestState = 'end';
            })
            .catch(function (result) {
                //error
                $scope.mimaYunweiLoginInfo = '网络错误';
                $scope.netRequestState = 'end';
            })
    };


    
})