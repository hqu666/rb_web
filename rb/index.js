var dbMsg = "[../index.js]";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);                                         //
const port = process.env.PORT || 3080;
dbMsg += ",http="+ http+",io="+ io+",port="+ port;
app.use(express.static(__dirname + '/public'));                                 //コンテンツの在処

var isDebug =true;                                                              //console出力
function myLog(dbMsg) {
    if(isDebug){
        console.log(dbMsg);
    }
}


/**
*/
var socketId;
function onConnection(socket){
    var dbMsg = "[onConnection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
    socketId=socket.id;
    socket.on('drawing', (data) => {                          //room　connect？
        dbMsg += "[socket.drawing]" + socket.id+",room=" + data.room;
        var roomVal = data.room;            // = getRoomVal(socket.id ,data.room);
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
    socket.on('sendcomp', (data) => {                          //room　connect？
        var dbMsg = "[sendcomp]room=" + data.room;
        var roomVal = data.room;
        dbMsg += ",roomVal=" + roomVal;
        socket.join(roomVal)
        io.sockets.in(roomVal).emit('sendcomp', data);                        //③指定のルームに属するクライアントに送る
    });
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
    socket.on('setmirror', (data) => {                          //room　connect？
        var dbMsg = "[setmirror]room=" + data.room;
        var roomVal = data.room;
        dbMsg += ",roomVal=" + roomVal;
        socket.join(roomVal)
        io.sockets.in(roomVal).emit('setmirror', data);                        //③指定のルームに属するクライアントに送る
    });
    socket.on('setmirror_h', (data) => {                          //room　connect？
        var dbMsg = "[setmirror_h]room=" + data.room;
        var roomVal = data.room;
        dbMsg += ",roomVal=" + roomVal;
        socket.join(roomVal)
        io.sockets.in(roomVal).emit('setmirror_h', data);                        //③指定のルームに属するクライアントに送る
    });
   socket.on('setautojudge', (data) => {                          //room　connect？
        var dbMsg = "[setautojudge]room=" + data.room;
        var roomVal = data.room;
        dbMsg += ",roomVal=" + roomVal;
        socket.join(roomVal)
        io.sockets.in(roomVal).emit('setautojudge', data);                        //③指定のルームに属するクライアントに送る
    });
    socket.on('allclear', (data) => {                          //room　connect？
        dbMsg += "[socket.allclear]" + socket.id+",room=" + data.room;
        var roomVal =data.room;
        dbMsg += ",roomVal=" + roomVal;
        myLog(dbMsg);
        socket.join(roomVal)
        io.sockets.in(roomVal).emit('allclear', data);                        //③指定のルームに属するクライアントに送る
    });

    socket.on('connection', (socket) => {                          //room　connect？
        var dbMsg = "[connection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
        myLog(dbMsg);
    });

    socket.on('conect_start', (config) => {             //game-start
        var dbMsg = "[conect_start]nickname=" + config.nickname;                //タイムスタンプ
        dbMsg += ",socket=" + socket.id;
        var roomVal = "/" + config.nickname;                                        //
        dbMsg += ",roomVal=" + roomVal;
        var urlStr = config.href;                                               //この時点のhref
        dbMsg += ",href=" + urlStr;
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

        myLog(dbMsg);
    });
    myLog(dbMsg);
}
io.on('connection', onConnection);          //onConnectionのソースを送る
//urlの取得
// http.listen(port, () => console.log('EC2>>> ec2-52-197-173-40.ap-northeast-1.compute.amazonaws.com:' + port));
// var urlinfo = require('url').parse( request.url , true );
// console.log( urlinfo );
// var urlStr = req.protocol + '://' + req.headers.host + req.url;     //☆Nodeで    var urlStr = location.href;　　は取得できない


var respo =  http.listen(port, () => console.log('web>>> '+  "http://127.0.0.1" +':' + port));   // クライアントの接続を待つ(IPアドレスとポート番号を結びつけます)
dbMsg += "　,http.listen="+respo;
myLog(dbMsg)
// console.log('index.js : >>> '+  "http://127.0.0.1" +':' + port);
