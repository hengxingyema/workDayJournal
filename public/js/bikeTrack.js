var app = angular.module('bikeTrackApp',[

]);

app.controller('bikeTrackCtrl', function ($scope, $http, $location) {



    // 本地存储获取其他页面传的参数，当页面关闭就消失
    var obj = JSON.parse(localStorage.getItem('obj'));

    $scope.point = obj.name

    var map; //地图对象
    $(document).ready(function() {
        LoadMap();
    });

    function LoadMap() {
        //显示地图
        map = new AMap.Map("map", {
            resizeEnable: true,
            zoom: 16
        });
        map.clearMap(); // 清除地图覆盖物
        //显示方向舵
        map.plugin(["AMap.ToolBar"], function() {
            map.addControl(new AMap.ToolBar());
        });
    }

     $scope.DrawLine = function() {
        map.clearMap(); // 清除地图覆盖物
        var Point = $(".InputTxt").val().trim();
        var str = "";
        if(Point != "") {
            var p = Point.split("|");
            $(p).each(function(n, item) {
                str += "[";
                str += item.split(",")[0];
                str += ",";
                str += item.split(",")[1];
                str += "],"

            });

            if(str.length > 0) {
                str = str.substring(0, str.length - 1);
            }

            str = "[" + str + "]";

            var lineArr = JSON.parse(str);

            var polyline = new AMap.Polyline({
                path: lineArr, //设置线覆盖物路径

                width: 16,
                height: 16,
                autoRotate: true,
                lineJoin: 'round',
                content: 'defaultPathNavigator',
                fillStyle: '#087EC4',
                strokeStyle: '#116394',
                lineWidth: 1,
            });
            polyline.setMap(map);

            var po = Point.split("|")[0];
            var n=Point.split("|").length;
            var p= Point.split("|")[n-1];
            map.panTo([po.split(',')[0], po.split(',')[1]]);
            AddMark(po,"2");
            AddMark(p,"1");

            // 本地存取的方法要记得用过之后清除缓存, 避免不必要的错误。
            (localStorage.removeItem('obj'))
        }
    }

    //在地图上添加点
    function AddMark(point, type) {

        var Postion = "[" + point.split(',')[0] + "," + point.split(',')[1] + "]";
        var icon
        if(type == "1") {
            icon = new AMap.Icon({
                image: '../images/startPoint.png',
                imageSize: new AMap.Size(38, 38)
            });
        }
        else
        {
            icon = new AMap.Icon({
                image: '../images/end.png',
                imageSize: new AMap.Size(38, 38)
            });
        }

        var marker = new AMap.Marker({
            icon: icon,
            position: JSON.parse(Postion),
            draggable: false, //是否可拖动
            offset: new AMap.Pixel(0, -36)
        });
        marker.setMap(map);
    }

})