/**
 * Created by wujiangwei on 2017/6/27.
 */
var app = angular.module('disconnectLogRemApp',[

]);

function dateStringToNetParam(dateStr) {
    var strList = dateStr.split("-");
    if(strList.length == 1){
        strList = dateStr.split("/");
    }
    if(strList[1].length == 1){
        strList[1] = '0' + strList[1];
    }
    if(strList[2].length == 1){
        strList[2] = '0' + strList[2];
    }

    return strList[0] + strList[1] + strList[2];
}


function translatecmdIDToDes(cmdID) {
    switch(parseInt(cmdID))
    {
        case 1:
            return "开锁命令";
            break;
        case 2:
            return "上锁命令";
            break;
        case 3:
            return "查询车辆状态";
            break;
        case 4:
            return "寻车命令";
            break;
        case 5:
            return "大灯闪烁命令";
            break;
        case 6:
            return "开电池仓";
            break;
        case 7:
            return "设置速度命令";
            break;
        case 8:
            return "";
            break;
        case 9:
            return "调整报警开关";
            break;
        case 10:
            return "恢复出厂命令";
            break;
        case 11:
            return "立即定位命令";
            break;
        case 12:
            return "立即重启命令";
            break;
        case 13:
            return "固件升级命令";
            break;
        case 15:
            return "播报语音命令";
            break;
        default:
            return "未知命令";
    }
}

function translateMessageTypeToDes(messageType) {
    switch(parseInt(messageType))
    {
        case 1:
            return "开锁周期报文";
            break;
        case 2:
            return "上锁周期报文";
            break;
        case 3:
            return "开始充电报文";
            break;
        case 4:
            return "断开充电报文";
            break;
        case 5:
            return "车辆报警报文";
            break;
        case 6:
            return "智能脚撑报文";
            break;
        case 7:
            return "蓝牙开锁报文";
            break;
        case 8:
            return "历史轨迹报文";
            break;
        case 9:
            return "低功耗报文";
            break;
        case 77:
            return "车辆网络断线";
            break;
        default:
            return "未知报文";
    }
}

function translateBTMessageTypeToDes(messageType) {
    switch(parseInt(messageType))
    {
        case 1:
            return "蓝牙开锁周期报文";
            break;
        case 2:
            return "蓝牙上锁周期报文";
            break;

        default:
            return "未知蓝牙响应";
    }
}

function toCoordinates(contentObject)
{
    if(contentObject.messageBody.latitudeMinute == undefined){
        return undefined;
    }
    var lat = Number(contentObject.messageBody.latitudeMinute) / 60.0 + Number(contentObject.messageBody.latitudeDegree);
    var lon = Number(contentObject.messageBody.longitudeMinute) / 60.0 + Number(contentObject.messageBody.longitudeDegree);

    return lat + ',' + lon;
    // return Wgs84ToGcj02.gps84_To_Gcj02(lat, lon).toString();
}


app.controller('disconnectLogRemCtrl', function($scope, $http, $location) {

    var todayDate = new Date();
    $scope.justBikeOperationLog = false;
    $scope.justBikeAlarm = false;
    $scope.justBikeGetReturn = false;
    //todayDate == 2017/10/09
    $scope.userSelectedOriginalTime = todayDate.toLocaleDateString() + ' 23:59:59';
    $scope.userSelectedStartTime = todayDate.toLocaleDateString() + ' 00:00:00';

    $(".ebike-log-flatpickr").flatpickr({

        defaultDate:todayDate,
        // maxDate: todayDate,
        onChange: function(selectedDates, dateStr, instance) {
            //dateStr == 2017-10-09
            $scope.userSelectedOriginalTime = dateStr + ' 23:59:59';
            $scope.selectedBikeLogDate = $scope.userSelectedOriginalTime;

            $scope.userSelectedStartTime = dateStr + ' 00:00:00';
            $scope.selectedStartLogDate = $scope.userSelectedStartTime;
            console.log($scope.userSelectedOriginalTime);
            getBikeLogs(0)
        }
    });

    $scope.bikeLogDateList = [];
    $scope.bikeDisplayLogDateList = [];
    $scope.pageDateCount = 100;

    $scope.currentPage = 0;

    getEBikeLogsFromMima(-1)

    function getBikeLogs(action) {
        if(action == -1){
            //上一页
            if($scope.currentPage >= 1) {
                //首次 Or Refresh
                toastr.info('获取之前的数据，需要最新数据，请刷新');

                $scope.currentPage--;

                var startSliceIndex = $scope.currentPage * $scope.pageDateCount;
                $scope.bikeDisplayLogDateList = $scope.bikeLogDateList.slice(startSliceIndex, startSliceIndex + $scope.pageDateCount);

                $('html,body').animate({scrollTop:0},'fast');
            }
        }else {
            if(action == 0) {
                //首次 Or Refresh
                $scope.currentPage = 0;

                $scope.bikeLogDateList = [];
                $scope.bikeDisplayLogDateList = [];
                $scope.selectedBikeLogDate = $scope.userSelectedOriginalTime;
                $scope.selectedStartLogDate = $scope.userSelectedStartTime;
                getEBikeLogsFromMima(action)
                toastr.info('开始刷新，起飞了');
            }else {
                if($scope.bikeLogDateList.length % $scope.pageDateCount > 0){
                    //无下一页了
                    toastr.info('没有更多的数据了');
                    return;
                }else {
                    $scope.currentPage++;
                    getEBikeLogsFromMima(action)
                    if(($scope.currentPage * $scope.pageDateCount + $scope.pageDateCount) < $scope.bikeLogDateList.length){
                        //下一页数据已经存在
                        toastr.info('获取之前的数据，需要最新数据，请刷新');
                        var startSliceIndex = $scope.currentPage * $scope.pageDateCount;
                        $scope.bikeDisplayLogDateList = $scope.bikeLogDateList.slice(startSliceIndex, startSliceIndex + (($scope.bikeLogDateList.length - startSliceIndex) >  $scope.pageDateCount) ? $scope.pageDateCount : ($scope.bikeLogDateList.length - startSliceIndex));

                        $('html,body').animate({scrollTop:0},'fast');
                    }
                }
            }

        }
    }

    //action = -1(pre page),1(next page),0(refresh)
    $scope.getEBikeLog = function (action) {
        getBikeLogs(action);
    };


    $scope.openGpsMap = function(gpsStr) {
        window.open("http://www.gpsspg.com/maps.htm");
    };

    $scope.openHistoryStr = function (historyLoctions) {
        alert(JSON.stringify(historyLoctions));
    };

    $scope.seeContent = function (Content) {
        alert(Content);
    };

    $scope.seeThisAreaEBikes = function () {
        //TODO
    }

    $scope.justBikeGetReturnClick = function () {
        if($scope.justBikeGetReturn == true){
            $scope.justBikeOperationLog = !$scope.justBikeGetReturn;
        }
    }

    $scope.justBikeOperationLogClick = function () {
        if($scope.justBikeOperationLog == true){
            $scope.justBikeGetReturn = !$scope.justBikeOperationLog;
        }
    }

    function getEBikeLogsFromMima(action) {
        //获取该辆车的日志信息
        if ($scope.selectedBikeLogDate == undefined && $scope.selectedStartLogDate == undefined){
            $scope.selectedBikeLogDate = $scope.userSelectedOriginalTime;
            $scope.selectedStartLogDate = $scope.userSelectedStartTime;

        }
        $http.post("/disconnectLogRem/disconnectLogRemList",{
            "pageCount":$scope.pageDateCount,
            "selectedTime":$scope.selectedBikeLogDate,
            "selectedStartTime":$scope.selectedStartLogDate,
            "justBikeOperationLog" : $scope.justBikeOperationLog,
            "justBikeAlarm": $scope.justBikeAlarm,
            "justBikeGetReturn": $scope.justBikeGetReturn
        })
            .then(function(result) {
                $scope.netRequestState = 'success';

                if(result.data.errorCode != 0){
                    $scope.currentErrorMsg = result.data.errorMsg;
                }
                if(action == 0) {
                    //首次或者刷新
                    $scope.bikeLogDateList = [];
                    $scope.bikeDisplayLogDateList = [];
                }

                $scope.selectedBikeLogDate = result.data.lastLogTime;
                var bikeLogList= result.data.ebikeHistoryLogs;

                //deal data
                for (var i = 0; i < bikeLogList.length; i++){
                    var serviceData = bikeLogList[i];

                    if(i == 0 && $scope.bikeLogDateList.length == 0){
                        $scope.todayTotalMessageCount = Math.floor(serviceData.ID / $scope.pageDateCount) + 1;
                    }

                    //报文类型
                    if(serviceData.SourceType == 1){
                        serviceData.isActive = true;
                    }

                    if(serviceData.LogType == 77){
                        serviceData.isActive = false;
                    }

                    //2个特殊报文
                    if(serviceData.LogType == 100 || serviceData.LogType == 99){
                        //借还车
                        // [15656672077]用户还车BT费用计算接口成功,车辆号：077100157
                        // [15656672077]用户还车成功(扣款成功),车辆号：077100157
                        //
                        // [18356610542]用户借车成功,车辆号：077100183
                        // [15888642133]用户借车失败,车辆号：077100124,此车处于下线状态

                        //str to object
                        var serviceDataContent = serviceData.Content;
                        if(serviceDataContent.indexOf("成功") != -1){
                            serviceData.isSucceed = true;
                        }else {
                            serviceData.isSucceed = false;
                        }

                        //截取content中的MsgSeq后的数字
                        //phone
                        var Index0 = serviceDataContent.indexOf("[");
                        var Index1 = serviceDataContent.indexOf("]");

                        var Index2 = serviceDataContent.indexOf("(");
                        var Index2Ex = serviceDataContent.indexOf(")");

                        var userPhone = serviceDataContent.substring(Index0 + 1, Index1);
                        serviceData.userPhone = serviceData.userPhone;
                        serviceData.bikeOperationResult = serviceData.bikeOperationResult;
                        serviceData.bikeOperationResultDes = serviceData.bikeOperationResultDes;
                        $scope.bikeLogDateList.push(serviceData);
                        continue;
                    }
                    else if(serviceData.LogType == 1){
                        serviceData.cmdDes = "车辆断线重连";
                        if(serviceData.Content.indexOf("成功") != -1){
                            serviceData.messageType = "登陆鉴权成功";
                            serviceData.isActive = false;
                        }else {
                            serviceData.messageType = "登陆鉴权失败";
                            serviceData.isActive = false;
                        }
                        $scope.bikeLogDateList.push(serviceData);
                        continue;
                    }


                    //其他报文
                    var serviceDataContent = serviceData.Content;
                    if(serviceDataContent.indexOf("MsgSeq:") != -1){
                        //截取content中的MsgSeq后的数字
                        var msgSeqIndex = serviceDataContent.indexOf("MsgSeq:");
                        var msgSeqEndIndex = serviceDataContent.indexOf(",", msgSeqIndex);
                        var MsgSeq = Number(serviceDataContent.substring(msgSeqIndex + 7, msgSeqEndIndex));
                        MsgSeq = MsgSeq%110;
                        switch (MsgSeq){
                            case 101:
                                serviceData.cmdSource = '觅马用户';
                                break;
                            case 102:
                                serviceData.cmdSource = '运维人员';
                                break;
                            case 100:
                                serviceData.cmdSource = '自动还车';
                                break;
                        }
                    }

                    var payloadIndex = serviceDataContent.indexOf("payload:");
                    if(payloadIndex != -1){
                        var contentStr = serviceDataContent.substring(payloadIndex + 8, serviceDataContent.length);
                        var contentObject = undefined;
                        try{
                            contentObject = JSON.parse(contentStr);

                            if(contentObject)
                                if(contentObject.messageBody != undefined){
                                    contentObject.messageBody.gpsPointStr = toCoordinates(contentObject);
                                }
                            if(contentObject.data != undefined){
                                contentObject.messageBody = contentObject.data;
                                contentObject.messageBody.gpsPointStr = toCoordinates(contentObject);
                            }

                            if(serviceData.SourceType == 1){
                                serviceData.firstMessageTag = translateBTMessageTypeToDes(contentObject.messageType);
                            }else {
                                serviceData.firstMessageTag = translateMessageTypeToDes(contentObject.messageType);
                            }

                        }catch(err) {
                            //other message
                            // serviceData.isActive = true;
                            serviceData.seeContent = true;
                            $scope.bikeLogDateList.push(serviceData);
                            continue;
                        }
                        serviceData.Content = contentObject;
                        //车辆参数设置
                        if(serviceData.Content != undefined && serviceData.Content.paramname != undefined){
                            serviceData.cmdSource = serviceData.Content.paramname + '=' + serviceData.Content.paramvalue;
                        }
                    }else {
                        var leftBracket = serviceDataContent.indexOf("{");
                        if(leftBracket != -1){

                            var contentStr = serviceDataContent.substring(leftBracket, serviceDataContent.length);
                            var contentObject = undefined;
                            try{
                                contentObject = JSON.parse(contentStr);
                            }catch(err) {
                                //other message
                                // serviceData.isActive = true;
                                serviceData.seeContent = true;
                                $scope.bikeLogDateList.push(serviceData);
                                continue;
                            }
                            serviceData.Content = contentObject;

                            //车辆参数设置
                            if(serviceData.Content != undefined && serviceData.Content.paramname != undefined){
                                serviceData.cmdSource = serviceData.Content.paramname + '=' + serviceData.Content.paramvalue;
                            }

                        }else {
                            serviceData.seeContent = true;
                            $scope.bikeLogDateList.push(serviceData);
                            continue;
                        }
                    }

                    if(serviceData.LogType == 5){
                        //服务器发送命令
                        if(serviceDataContent.indexOf("转发命令请求失败") != -1){
                            //截取请求失败后的原因
                            var cmdIndex = serviceDataContent.indexOf("转发命令请求失败");
                            var cmdEndIndex = serviceDataContent.indexOf(",", cmdIndex);
                            var cmdSendResult = serviceDataContent.substring(cmdIndex + 4, cmdEndIndex);
                            serviceData.firstMessageTag = cmdSendResult;
                            serviceData.isActive = false;
                        }else {
                            serviceData.firstMessageTag = '发送命令成功';
                        }

                    }else if(serviceData.LogType == 6){
                        if(serviceData.Content.result != undefined){
                            // serviceData.Content.result = 1;
                            var resultStr = undefined;
                            switch (parseInt(serviceData.Content.result)){
                                case 0:
                                    resultStr = '车辆回复成功';
                                    break;
                                case 1:
                                    resultStr = '车辆回复失败';
                                    break;
                                case 2:
                                    resultStr = '命令发送失败';
                                    break;
                                default:
                                    resultStr = '未知失败' + serviceData.Content.result
                                    break;
                            }
                            serviceData.cmdSource = resultStr;
                            if(serviceData.Content.result != 0){
                                serviceData.isActive = false;
                                serviceData.firstMessageTag = '响应失败';
                            }else {
                                serviceData.firstMessageTag = '响应成功';
                            }
                        }else {
                            // serviceData.firstMessageTag = 'resl';
                        }
                    }

                    //commend ID
                    if(contentObject.cmdID != undefined){
                        serviceData.cmdDes = translatecmdIDToDes(contentObject.cmdID);
                        // serviceData.isActive = true;

                        //argument 设置
                        if(serviceData.Content.argument != undefined){
                            var string = JSON.stringify(serviceData.Content.argument)
                            if (string.length > 5){
                                serviceData.cmdSource = serviceData.cmdSource;
                            }
                            else {
                                serviceData.cmdSource = serviceData.cmdSource + "Argument: " + JSON.stringify(serviceData.Content.argument);
                            }

                        }
                    }

                    //deal data
                    if(serviceData.Content.messageBody != undefined){
                        //deal gps type
                        if(serviceData.Content.messageBody.gpstype != undefined){
                            switch (serviceData.Content.messageBody.gpstype){
                                case 0:
                                    serviceData.Content.messageBody.gpstypDes = "无";
                                    break;
                                case 1:
                                    serviceData.Content.messageBody.gpstypDes = "实时";
                                    break;
                                case 2:
                                    serviceData.Content.messageBody.gpstypDes = "历史";
                                    break;
                                default:
                                    serviceData.Content.messageBody.gpstypDes = "";
                                    break;
                            }
                        }
                        //deal ebike job type
                        if(serviceData.Content.messageBody.ctrlState != undefined) {
                            switch (serviceData.Content.messageBody.ctrlState) {
                                case 1:
                                    serviceData.Content.messageBody.ctrlStateDes = "车辆未通电";
                                    break;
                                case 2:
                                    serviceData.Content.messageBody.ctrlStateDes = "工作";
                                    break;
                                case 3:
                                    serviceData.Content.messageBody.ctrlStateDes = "车辆防盗";
                                    break;
                                default:
                                    serviceData.Content.messageBody.ctrlStateDes = "";
                                    break;
                            }
                        }
                        //deal ebike job type
                        if(serviceData.Content.messageBody.alarmType != undefined) {
                            switch (serviceData.Content.messageBody.alarmType) {
                                case 1:
                                    serviceData.Content.messageBody.alarmTypeDes = "车辆倒地";
                                    break;
                                case 2:
                                    serviceData.Content.messageBody.alarmTypeDes = "非法触碰";
                                    break;
                                case 3:
                                    serviceData.Content.messageBody.alarmTypeDes = "非法位移";
                                    break;
                                case 4:
                                    serviceData.Content.messageBody.alarmTypeDes = "电源断电";
                                    break;
                                case 9:
                                    serviceData.Content.messageBody.alarmTypeDes = "车辆扶正";
                                    break;
                                default:
                                    serviceData.Content.messageBody.alarmTypeDes = "";
                                    break;
                            }
                        }
                    }

                    $scope.bikeLogDateList.push(serviceData);
                }

                //tail data
                var startIndex = $scope.currentPage * $scope.pageDateCount;
                $scope.bikeDisplayLogDateList = $scope.bikeLogDateList.slice(startIndex, startIndex + bikeLogList.length);

                $('html,body').animate({scrollTop:0},'fast');
            })
            .catch(function (result) {
                //error
                console.log(result);
                $scope.netRequestState = 'error';
            })
            .finally(function () {
                //
            });


    }

});