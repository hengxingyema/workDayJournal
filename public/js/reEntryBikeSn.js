var app = angular.module('reEntryBikeSnApp',['Encrypt'])

app.controller('reEntryBikeSnCtrl',
    [ '$scope', '$http', 'Md5', 'Base64', 'Sha1', '$interval',function ($scope,$http,Md5,Base64,Sha1,$interval) {

    document.oncontextmenu = function(){
        return false;
    }

    var mo=function(e){e.preventDefault();};
    function stop(){
        document.body.style.overflow='hidden';
        document.addEventListener("touchmove",mo,false);//禁止页面滑动
    }

    $scope.timestamp = new Date().getTime();

    $scope.mimacxSign = Md5.hex_md5($scope.timestamp + '98klFJ=UX!878_XX8fk')

    $scope.yunweiAccountSession = undefined;
    $scope.yunWeiLogin = function () {

        $scope.netRequestState = 'start';
        $http.post("http://yw.mimacx.com/Peration/Login",{
            "UserName" : "wucailongMaster",
            "UserPass" : "wcl",
            "mimacxtimeSpan" : $scope.timestamp,
            "mimacxSign" : $scope.mimacxSign
        })
        .then(function(result) {
            var response = result.data;
            if(response.returnCode == '1'){
                $scope.yunweiAccountSession = response.Data.SessionKey;
                $scope.mimaYunweiLoginInfo = response.Data.LoginName;

            }else {
                //error
                $scope.mimaYunweiLoginInfo = response.returnMsg;
            }
        })
    };

    var vm=$scope.vm={};
    vm.style='blue';
    vm.progress=0;
    vm.text=true;
    $scope.reEntryBike = function () {
        vm.progress=0;

        if ($scope.yunweiAccountSession != undefined){
            $http.post("http://yw.mimacx.com/Operations/UpdateSystemNo",{
                "SessionKey": $scope.yunweiAccountSession,
                "mimacxtimeSpan" : $scope.timestamp,
                "mimacxSign" : $scope.mimacxSign,
                "BicycleNo" : $scope.bikeNumber,
                "SystemNo" : 'mimacx' + $scope.bikeSnNumber
            })
            .then(function(result) {
                var response = result.data;

                if(response.returnCode == '200'){
                    $scope.reEntryBikeInfo = response.returnMsg;
                    vm.progress=100;
                    $interval(function () {
                        vm.progress=10;
                    },5000)

                }else {
                    //error
                    $scope.reEntryBikeInfo = response.returnMsg;
                    vm.progress=50;
                }

            })
        }else {
            $scope.reEntryBikeInfo = '请先登录运维账号';
            vm.progress=0;
        }
    }
}])