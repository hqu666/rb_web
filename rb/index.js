
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3080;


app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  // socket.on('changeColor', (data) => socket.broadcast.emit('changeColor', data));           //線の色
  // socket.on('changeLineWidth', (data) => socket.broadcast.emit('changeLineWidth', data));   //線の太さ
  // socket.on('changeLineCap', (data) => socket.broadcast.emit('changeLineCap', data));   //先端形状
  socket.on('allclear', (data) => socket.broadcast.emit('allclear', data));		       		//全消去
}

io.on('connection', onConnection);
//urlの取得
  // var urlReq = require('url');

  // var requrl = url.format({
  //     protocol: req.protocol,
  //     host: req.get('host'),
  //     pathname: req.originalUrl,
  // });
// var urlobj = url.parse(req.originalUrl);
// urlobj.protocol = req.protocol;
// urlobj.host = req.get('host');
// var requrl = url.format(urlobj);
// var body = req.protocol + '://' + req.headers.host + req.url;

//http.listen(port, () => console.log('EC2>>> ec2-52-197-173-40.ap-northeast-1.compute.amazonaws.com:' + port));
http.listen(port, () => console.log('web>>> '+  "http://127.0.0.1" +':' + port));
console.log('index.js : >>> '+  "http://127.0.0.1" +':' + port);
