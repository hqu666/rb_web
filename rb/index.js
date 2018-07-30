
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3080;


app.use(express.static(__dirname + '/public'));

function onConnection(socket){
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('sendcomp', (data) => socket.broadcast.emit('sendcomp', data));
    socket.on('drawend', (data) => socket.broadcast.emit('drawend', data));
    socket.on('changeColor', (data) => socket.broadcast.emit('changeColor', data));           //線の色
    socket.on('changeLineWidth', (data) => socket.broadcast.emit('changeLineWidth', data));   //線の太さ
    socket.on('changeLineCap', (data) => socket.broadcast.emit('changeLineCap', data));   //先端形状
    socket.on('setmirror', (data) => socket.broadcast.emit('setmirror', data));
    socket.on('setautojudge', (data) => socket.broadcast.emit('setautojudge', data));
    socket.on('allclear', (data) => socket.broadcast.emit('allclear', data));		       		//全消去
}

io.on('connection', onConnection);
//urlの取得

// http.listen(port, () => console.log('EC2>>> ec2-52-197-173-40.ap-northeast-1.compute.amazonaws.com:' + port));
//☆ここで    var urlStr = location.href;　　は取得できない
var now = new Date();
var UrlPparam =  "?sesion=" +  now.getYear() +(now.getMonth()+1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds();		// "?sesion="
http.listen(port, () => console.log('web>>> '+  "http://127.0.0.1" +':' + port));       //cd H:\develop\xampp\htdocs\repireBrain\rb
console.log('index.js : >>> '+  "http://127.0.0.1" +':' + port);
