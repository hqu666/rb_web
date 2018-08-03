var dbMsg = "[../index.js]";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);                                         //
const port = process.env.PORT || 3080;
dbMsg += ",http="+ http+",io="+ io+",port="+ port;
// var roomVal;
var roomArray = new Array();
var clientID =  0;
app.use(express.static(__dirname + '/public'));                                 //コンテンツの在処
var store = {};

var isDebug =true;                                                              //console出力
function myLog(dbMsg) {
    if(isDebug){
        console.log(dbMsg);
    }
}

/**
*連想配列の既存位置検索
*/
function getArryPosition(fArray ,fal ){
    var dbMsg = "[getArryPosition]" ;
     dbMsg += "fArray=" + fArray.length +"件";
     dbMsg += "で" + fal +"を検索";
    var sPosition = -1;
    for(var i=0 ;i< fArray.length-1;i++){
        if( roomArray[i].name == fal){
            sPosition = i;
            break;
        }
    }
    dbMsg += ">>" + sPosition +"件目";
       // myLog(dbMsg);
    return sPosition;
}
/**
*room配列をsocket.idで検索し、無ければ追加
*/
function getRoomVal(sID ,rVal ){
    var dbMsg = "[getRoomVal]socket=" + sID;
    dbMsg += ",roomVal=" + rVal;
    var sPosition = getArryPosition(roomArray ,sID );
    dbMsg += "(" + sPosition +")";
    if(-1 < sPosition){
        // if(-1 < roomArray.indexOf(sid)){
        rVal = roomArray[sPosition].value;			//rgb2hex("rgb("+ oRed + ", " + oGreen + ", " + oGreen +")");
        dbMsg += "既存";
    } else if(rVal != ""){
        roomArray[roomArray.length]={ name:sID, value:rVal };		//カウント付きの連想配列にも要素追加
        dbMsg += ">追加" + roomArray.length + "件目" ;
    }else{
        dbMsg += ">skip" ;
    }
    // myLog(dbMsg);
    return rVal;
}
/**
*各種接続処理
*/
var socketId;
function onConnection(socket){
    var dbMsg = "[onConnection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
    socketId=socket.id;
    var roomVal = getRoomVal(socket.id ,"" );
    dbMsg += ",roomVal=" + roomVal;
    // if(roomVal != ""){
    //     dbMsg += "既存";
    //     socket.join(roomVal);
    //     io.of(roomVal).on('drawing', function (data) {
    //          dbMsg += "[drawing]";
    //         // myLog(dbMsg);
    //         // io.of(roomVal).emit('drawing', data);
    //         dbMsg ="";
    //         socket.broadcast.emit('drawing', data);
    //     });
    //     io.of(roomVal).on('allclear', function (data) {
    //          dbMsg += "[allclear]";
    //         myLog(dbMsg);
    //         // io.of(roomVal).emit('allclear', data);
    //         socket.broadcast.emit('allclear', data);
    //         dbMsg ="";
    //     });
    // }else{
        dbMsg += roomArray.length+ "件中room不明";
        // socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));                 //socket.on(
        socket.on('drawing', (data) => {                          //room　connect？
            dbMsg += "[socket.drawing]" + socket.id+",room=" + data.room;
            var roomVal = getRoomVal(socket.id ,data.room);
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('drawing', data);                        //③指定のルームに属するクライアントに送る
            // socket.broadcast.to(roomVal).emit('drawing', data);          //①emitを行ったソケット以外の、指定のルームに属するクライアントに送る
            // socket.broadcast.emit('drawing', data);                          //②emitしたソケット以外の全クライアントに送る
            // io.sockets.emit('drawing', data);                                //④全クライアントに送る
            // var room = io.of(roomVal); // roomもまたServerインスタンスになる
            // room.emit('drawing', data);
            dbMsg ="";
        });
        // socket.on('sendcomp', (data) => socket.broadcast.emit('sendcomp', data));
        socket.on('sendcomp', (data) => {                          //room　connect？
            var dbMsg = "[sendcomp]room=" + data.room;
            var roomVal = data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('sendcomp', data);                        //③指定のルームに属するクライアントに送る
        });
           // socket.on('drawend', (data) => socket.broadcast.emit('drawend', data));
       socket.on('drawend', (data) => {                          //room　connect？
           var dbMsg = "[drawend]room=" + data.room;
           var roomVal = data.room;
           dbMsg += ",roomVal=" + roomVal;
           socket.join(roomVal)
           io.sockets.in(roomVal).emit('drawend', data);                        //③指定のルームに属するクライアントに送る
       });
        socket.on('changeColor', (data) => {                          //room　connect？
            var dbMsg = "[changeColor]room=" + data.room;
            var roomVal = data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('changeColor', data);                        //③指定のルームに属するクライアントに送る
        });
        socket.on('changeLineWidth', (data) => {                          //room　connect？
            var dbMsg = "[changeLineWidth]room=" + data.room;
            var roomVal = data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('changeLineWidth', data);                        //③指定のルームに属するクライアントに送る
        });
        socket.on('changeLineCap', (data) => {                          //room　connect？
            var dbMsg = "[changeLineCap]room=" + data.room;
            var roomVal =data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('changeLineCap', data);                        //③指定のルームに属するクライアントに送る
        });
        // socket.on('setmirror', (data) => socket.broadcast.emit('setmirror', data));
        socket.on('setmirror', (data) => {                          //room　connect？
            var dbMsg = "[setmirror]room=" + data.room;
            var roomVal = data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('setmirror', data);                        //③指定のルームに属するクライアントに送る
        });
        // socket.on('setautojudge', (data) => socket.broadcast.emit('setautojudge', data));
        socket.on('setautojudge', (data) => {                          //room　connect？
            var dbMsg = "[setautojudge]room=" + data.room;
            var roomVal = data.room;
            dbMsg += ",roomVal=" + roomVal;
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('setautojudge', data);                        //③指定のルームに属するクライアントに送る
        });
        // socket.on('allclear', (data) => socket.broadcast.emit('allclear', data));		       		//全消去
        socket.on('allclear', (data) => {                          //room　connect？
            dbMsg += "[socket.allclear]" + socket.id+",room=" + data.room;
            var roomVal =data.room;
            dbMsg += ",roomVal=" + roomVal;
            myLog(dbMsg);
            socket.join(roomVal)
            io.sockets.in(roomVal).emit('allclear', data);                        //③指定のルームに属するクライアントに送る
        // socket.broadcast.to(roomVal).emit('allclear', data);          //①emitを行ったソケット以外の、指定のルームに属するクライアントに送る
            // socket.broadcast.emit('allclear', data);                          //②emitしたソケット以外の全クライアントに送る
            // io.sockets.emit('allclear', data);                                //④全クライアントに送る
            // var room = io.of(roomVal); // roomもまたServerインスタンスになる
            // room.emit('allclear', data);
        });
        // dbMsg += "(" + roomArray.length + ")"+ "追加";
        // dbMsg ="";
    // }

    socket.on('connection', (socket) => {                          //room　connect？
        var dbMsg = "[connection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
        myLog(dbMsg);
    });

    socket.on('conect_start', (config) => {             //game-start
        var dbMsg = "[conect_start]nickname=" + config.nickname;                //タイムスタンプ
        dbMsg += ",socket=" + socket.id;
        var roomVal = "/" + config.nickname;                                        //
        roomVal = getRoomVal(socket.id ,roomVal);
        dbMsg += ",roomVal=" + roomVal;
        // socket.join(roomVal)
        var urlStr = config.href;                                               //この時点のhref
        dbMsg += ",href=" + urlStr;
        // room= io.connect(urlStr);
        // room = socket.connect(urlStr + config.nickname);
        if(-1 == urlStr.indexOf('127.0.0') && -1 == urlStr.indexOf('192.168')){ //xamppでのテストで無ければ
            isDebug =false;                                                     //デバッグログを吐かせない
        }
        socket.emit('conect_start', config.nickname);
        myLog(dbMsg);
    });

    socket.on('disconnect', () => {
        var dbMsg = "[disconnect]" ;
        var sID =  socket.id;
        dbMsg += ",socket=" + sID;
        dbMsg += ",roomArray=" + Object.keys(roomArray).length + "件" ;
        var sPosition = getArryPosition(roomArray ,sID );
        dbMsg += ",index=" + sPosition;
        if(-1 < sPosition){
            dbMsg += "," +roomArray[sPosition].value;
            // delete roomArray[sPosition];
            delete roomArray[sID];
            dbMsg += ">削除後は" +  Object.keys(roomArray).length + "件" ;
        }else{
            dbMsg += ">削除無し";
        }
        myLog(dbMsg);
    });
    myLog(dbMsg);
}
io.on('connection', onConnection);          //onConnectionのソースを送る
//urlの取得
// http.listen(port, () => console.log('EC2>>> ec2-52-197-173-40.ap-northeast-1.compute.amazonaws.com:' + port));
//☆ここで    var urlStr = location.href;　　は取得できない
// var now = new Date();
// var s_time = "" + now.getYear() +(now.getMonth()+1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds();		// "?sesion="
// dbMsg += "　,s_time="+s_time;			//,UrlPparam=?sesion=11872218750　,wifiURL=http://192.168.3.10

var respo =  http.listen(port, () => console.log('web>>> '+  "http://127.0.0.1" +':' + port));   // クライアントの接続を待つ(IPアドレスとポート番号を結びつけます)
dbMsg += "　,http.listen="+respo;
myLog(dbMsg)
// console.log('index.js : >>> '+  "http://127.0.0.1" +':' + port);
