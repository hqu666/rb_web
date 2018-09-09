var dbMsg = "[../index.js]";
// const util = require("/public/util.js");         //利かず；https://teratail.com/questions/45828

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);                                         //
const port = process.env.PORT || 3080;
dbMsg += ",http="+ http+",io="+ io+",port="+ port;
app.use(express.static(__dirname + '/public'));                                 //コンテンツの在処
//リリース時課題；各rooomごとに保持させる方法
//その部屋のcanvas.paintプロパティ
var currentColor='';
var currentWidth=0;
var currentLineCap="";
// var isComp=false;				//比較中	;scoreStartRadyでtrueに設定

var isDebug =true;                                                              //console出力
function myLog(dbMsg) {
    if(isDebug){
        console.log(dbMsg);
    }
}

/**
*転送処理
*/
function sendSocet(emName ,socket, data){
    var roomVal = data.room;
    var dbMsg ="room=" + roomVal;
    dbMsg += "," + socket.id;
    dbMsg += "；" + emName;

    if(roomVal != ""){                                                  //room指定
        socket.join(roomVal)
        io.sockets.in(roomVal).emit(emName, data);                        //③指定のルームに属するクライアントに送る
    }else{                                                              //何も指定が無ければ
        socket.emit(emName, data);                                      //全員にブロードキャスト
    }
    var act = -1;
    if(emName == 'drawing'){
        act = data.action * 1;
    }
    if(act != 1){               //move以外の座標比
        if(emName == 'drawing'){
            dbMsg += "(" + data.x0 + " , " + data.y0 + ")～(" + data.x1 + " , " + data.y1 + ")";
            // dbMsg +=  data.color + "," + data.width + "px,lineCap=" + data.lineCap + ",action= " + data.action;
        }
        if(data.color){
            dbMsg += ",color=" + data.color ;
            currentColor = data.color;
        }
        if(data.width){
            dbMsg += ",width=" + data.width ;
            currentWidth = data.width;
        }
        if(data.lineCap){
            dbMsg += ",lineCap=" + data.lineCap ;
            currentLineCap = data.lineCap;
        }
        if(data.action){
            dbMsg += ",action=" + data.action ;
        }
        myLog(dbMsg);
    }
}

/**
*接続する機能の中継；受信して振り分け
*/
var socketId;
function onConnection(socket){
    var dbMsg = "[onConnection]socket=" + socket.id;          //ukTPEyxXW_HOx_eoAAAAなど
    socketId=socket.id;

    socket.on('drawing', (data) => {                          //room　connect？
        dbMsg += "[socket.drawing]";
        sendSocet('drawing' ,socket, data);
        dbMsg ="";
    });

    socket.on('sendcomp', (data) => {
        var dbMsg = "[sendcomp]";
        currentColor = data.color;
        currentWidth = data.width;
        currentLineCap = data.lineCap;
        isComp = true;
        sendSocet('sendcomp' , socket , data);
    });

    socket.on('drawend', (data) => {
        var dbMsg = "[drawend]";
        sendSocet('drawend' , socket , data);
    });

    socket.on('changeColor', (data) => {
        var dbMsg = "[changeColor]";
        currentColor = data.color;
    sendSocet('changeColor' , socket , data);
    });

    socket.on('change_line_width', (data) => {
        var dbMsg = "[change_line_width]" ;
        currentWidth = data.width;
        sendSocet('change_line_width' , socket , data);
    });

    socket.on('changeLineCap', (data) => {
        var dbMsg = "[changeLineCap]";
        currentLineCap = data.lineCap;
        sendSocet('changeLineCap' , socket , data);
    });

    socket.on('setmirror', (data) => {
        var dbMsg = "[setmirror]" ;
        sendSocet('setmirror' , socket , data);
    });

    socket.on('setmirror_h', (data) => {
        var dbMsg = "[setmirror_h]";
        sendSocet('setmirror_h' , socket , data);
    });

    socket.on('setautojudge', (data) => {
        var dbMsg = "[setautojudge]" ;
        sendSocet('setautojudge' , socket , data);
    });

    socket.on('allclear', (data) => {
        var dbMsg = "[socket.allclear]";
        sendSocet('allclear' , socket , data);
    });

    socket.on('conect_comp', (data) => {                                       //標準コールバック確認中
        var dbMsg = "[conect_comp]";          //ukTPEyxXW_HOx_eoAAAAなど
        myLog(dbMsg);
        sendSocet('conect_comp' , socket , data);
    });

    socket.on('scre_dlog_show', (data) => {                                       //スコアダイアログ表示
        var dbMsg = "[scre_dlog_show]";
        myLog(dbMsg);
        sendSocet('scre_dlog_show' , socket , data);
    });

    socket.on('scre_dlog_modolu', (data) => {                                       //スコアダイアログからもう一度try
        var dbMsg = "[scre_dlog_modolu]";
        myLog(dbMsg);
        sendSocet('scre_dlog_modolu' , socket , data);
    });

    socket
    .on
    ('scre_dlog_next', (data) => {                                       //スコアダイアログから次の課題へ送る
        var dbMsg = "[scre_dlog_next]";
        myLog(dbMsg);
        sendSocet('scre_dlog_next' , socket , data);
    });

    socket.on('conect_start', (data) => {                                     //onloadから呼ばれる接続開始
        var dbMsg = "[conect_start]nickname=" + data.room;                //タイムスタンプ
        dbMsg += ",socket=" + socket.id;
        var roomVal = "/" + data.room;                                        //
        dbMsg += ",roomVal=" + roomVal;
        var urlStr = data.href;                                               //この時点のhref
        dbMsg += ",href=" + urlStr;
         if(-1 == urlStr.indexOf('127.0.0') && -1 == urlStr.indexOf('192.168')){ //xamppでのテストで無ければ
            isDebug =false;                                                     //デバッグログを吐かせない
        }
        // var data;
        // data.room = data.nickname;
        data.color = currentColor;
        data.width = currentWidth;
        data.lineCap = currentLineCap;
        sendSocet('conect_start',socket, data);
    });

    socket.on('disconnect', () => {             //各クライアントが接続を解除した場合に発生する標準コールバック
        var dbMsg = "[disconnect]" ;
        dbMsg += ",socket=" + socket.id;
        myLog(dbMsg);
    });
    // myLog(dbMsg);
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
