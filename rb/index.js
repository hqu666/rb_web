var dbMsg = "[../index.js]";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);                                         //
const port = process.env.PORT || 3080;
dbMsg += ",http="+ http+",io="+ io+",port="+ port;
var roomVal;
var isDebug =true;                                                              //console出力
function myLog(dbMsg) {
    if(isDebug){
        console.log(dbMsg);
    }
}

app.use(express.static(__dirname + '/public'));                                 //コンテンツの在処
var store = {};
function onConnection(socket){
    var dbMsg = "[onConnection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
    dbMsg += ",roomVal=" + roomVal;
    // var rRoom = io.sockets.manager.roomClients[socket.id];
    // var dbMsg = ",room=" + rRoom;          //ukTPEyxXW_HOx_eoAAAAなど
    // socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));                 //socket.on(
    socket.on('drawing', (data) => {                          //room　connect？
        var dbMsg = "[drawing]room=" + data.room;
        // myLog(dbMsg);
        // var chat = io.of(data.room);
        // chat.emit('drawing', data);
        // socket.to(data.room).json.emit('drawing', data);
        // io.sockets.in(data.room+"").emit('drawing', data);
        // socket.broadcast.to(data.room).emit('drawing', data);
        socket.broadcast.emit('drawing', data);
    });
    // socket.on('sendcomp', (data) => socket.broadcast.emit('sendcomp', data));
    socket.on('sendcomp', (data) => {                          //room　connect？
        var dbMsg = "[sendcomp]room=" + data.room;
        myLog(dbMsg);
        io.sockets.in(data.room).emit('sendcomp', data);
    });
       // socket.on('drawend', (data) => socket.broadcast.emit('drawend', data));
   socket.on('drawend', (data) => {                          //room　connect？
       var dbMsg = "[drawend]room=" + data.room;
       myLog(dbMsg);
       io.sockets.in(data.room).emit('drawend', data);
   });
    // socket.on('changeColor', (data) => socket.broadcast.emit('changeColor', data));           //線の色
    socket.on('changeColor', (data) => {                          //room　connect？
        var dbMsg = "[changeColor]room=" + data.room;
        myLog(dbMsg);
        socket.broadcast.to(data.room).emit('changeColor', data);
    });
    // socket.on('changeLineWidth', (data) => socket.broadcast.emit('changeLineWidth', data));   //線の太さ
    socket.on('changeLineWidth', (data) => {                          //room　connect？
        var dbMsg = "[changeLineWidth]room=" + data.room;
        myLog(dbMsg);
        socket.broadcast.to(data.room).emit('changeLineWidth', data);
    });
    // socket.on('changeLineCap', (data) => socket.broadcast.emit('changeLineCap', data));   //先端形状
    socket.on('changeLineCap', (data) => {                          //room　connect？
        var dbMsg = "[changeLineCap]room=" + data.room;
        myLog(dbMsg);
        socket.broadcast.to(data.room).emit('changeLineCap', data);
    });
    // socket.on('setmirror', (data) => socket.broadcast.emit('setmirror', data));
    socket.on('setmirror', (data) => {                          //room　connect？
        var dbMsg = "[setmirror]room=" + data.room;
        myLog(dbMsg);
        socket.broadcast.to(data.room).emit('setmirror', data);
    });
    // socket.on('setautojudge', (data) => socket.broadcast.emit('setautojudge', data));
    socket.on('setautojudge', (data) => {                          //room　connect？
        var dbMsg = "[setautojudge]room=" + data.room;
        myLog(dbMsg);
        socket.broadcast.to(data.room).emit('setautojudge', data);
    });
    // socket.on('allclear', (data) => socket.broadcast.emit('allclear', data));		       		//全消去
    socket.on('allclear', (data) => {                          //room　connect？
        dbMsg += "[allclear]room=" + data.room;
        myLog(dbMsg);
        // var chat = io.of(data.room);
        // chat.emit('allclear', data);
        // socket.to(data.room).json.emit('allclear', data);
        // io.sockets.in(data.room+"").emit('allclear', data)
        socket.broadcast.emit('allclear', data);
    });
    socket.on('connection', (socket) => {                          //room　connect？
        var dbMsg = "[connection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
        myLog(dbMsg);
    });
    socket.on('conect_start', (config) => {             //game-start
        var dbMsg = "[conect_start]nickname=" + config.nickname;                //タイムスタンプ
        roomVal = "/" + config.nickname;
        socket.join(config.nickname, () => {
          let rooms = Object.keys(socket.rooms);
          console.log(rooms); // [ <socket.id>, 'room 237' ]=[ 'F95r51aMRyUHIeo8AAAI', '20180802175106' ]
        });
        var urlStr = config.href;                                               //この時点のhref
        dbMsg += ",href=" + urlStr;
        // room= io.connect(urlStr);
        // room = socket.connect(urlStr + config.nickname);
        if(-1 == urlStr.indexOf('127.0.0') && -1 == urlStr.indexOf('192.168')){ //xamppでのテストで無ければ
            isDebug =false;                                                     //デバッグログを吐かせない
        }
        dbMsg += ",socket=" + socket.id;
        socket.emit('conect_start', socket.id);
        myLog(dbMsg);
    });

    socket.on('disconnect', () => {
        var dbMsg = "[disconnect]" ;
        dbMsg += ",socket=" + socket.id;
        myLog(dbMsg);
    });
    myLog(dbMsg);
}
io.on('connection', onConnection);          //onConnectionのソースを送る
//urlの取得
// http.listen(port, () => console.log('EC2>>> ec2-52-197-173-40.ap-northeast-1.compute.amazonaws.com:' + port));
//☆ここで    var urlStr = location.href;　　は取得できない
var now = new Date();
var s_time = "" + now.getYear() +(now.getMonth()+1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds();		// "?sesion="
dbMsg += "　,s_time="+s_time;			//,UrlPparam=?sesion=11872218750　,wifiURL=http://192.168.3.10

http.listen(port, () => console.log('web>>> '+  "http://127.0.0.1" +':' + port));   // クライアントの接続を待つ(IPアドレスとポート番号を結びつけます)
myLog(dbMsg)
// console.log('index.js : >>> '+  "http://127.0.0.1" +':' + port);
