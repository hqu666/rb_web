'use strict';

(function() {
	var dbMsg = "index.js;"
	var socket = io();
	var canvas = document.getElementsByClassName('whiteboard')[0];				//描画領域
	var typeSelect = document.getElementById('typeSelect');						//描画種別
	var colorPalet = document.getElementById('colorPalet');						//カラーパレット

	var graficOptions = document.getElementById('graficOptions');				//グラフィック設定
	var lineWidthSelect = document.getElementById('lineWidthSelect');			//線の太さ
	var lineCapSelect = document.getElementById('lineCapSelect');				//先端形状

	var texeOptions = document.getElementById('texeOptions');					//テキスト設定

	var eventComent = document.getElementById("eventComent");
	eventComent.innerHTML = "Drow OK";
	var $document = $(document);
	var $hitarea = $('#whiteboard');
	var context = canvas.getContext('2d');
	var current = {
		color:'#00FF00'
		// ,width:'5'
	};
	colorPalet.value=current.color;
	lineWidthSelect.value= 5;				//current.width;
	current.width =  lineWidthSelect.value;
	current.lineCap =  "round";

	texeOptions.style.display="none";
	var drawing = false;


	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('mouseout', onMouseUp, false);
	canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  /////////////////////////////////////////////////////////////////////////////
	typeSelect.onchange = function () {					 //描画する種類を変更
		dbMsg = "typeSelect;";
		var currenttype =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",typeSelect="+ currenttype;
		if(currenttype == "free"){
			texeOptions.style.display="none";
			graficOptions.style.display="border-box";
		}else if(currenttype == "text"){
			// graficOptions.style.display="none";
			// texeOptions.style.display="border-box";
			var res = confirm('作成中です。');
			if( res == true ) {
			}else {
			}
		}else{
			alert( '作成中です。');  //数値と文字の結合
			texeOptions.style.display="none";
			graficOptions.style.display="border-box";
		}
		typeSelect.value =  "free";
		myLog(dbMsg);
	}

	colorPalet.onchange = function () {					 // カラーパレットからの移し替え
		dbMsg = "colorPalet;";
		current.color =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",selectColor="+ current.color;
		// socket.emit('changeColor', current.color);
		myLog(dbMsg);
	}

	lineWidthSelect.onchange = function () {
		dbMsg = "lineWidthSelect;";
		var selectWidth = this.value
		current.width =  selectWidth;
		dbMsg += ",selectWidth="+ current.width;
		// socket.emit('changeLineWidth', current.width);
		myLog(dbMsg);
	}

	lineCapSelect.onchange = function () {				//先端形状
		dbMsg = "lineCapSelect;";
		var lineCap = this.value
		current.lineCap =  lineCap;
		dbMsg += ",lineCap="+ current.lineCap;
		// socket.emit('changeLineCap', current.lineCap);
		myLog(dbMsg);
	}

	document.getElementById("allclear").onclick = function() {
		allClear();
		socket.emit('allclear', {});
	}

//イベント受信////////////////////////////////////////////////////////////////////////////
	socket.on('drawing', function(data) {
		dbMsg += "recive:drawing";
		onDrawingEvent(data);
		myLog(dbMsg);
	});

	// socket.on('changeColor', function(data) {
	// 	var dbMsg = "recive:chngeColor="+data;
	// 	current.color = data;			 // current.color = e.target.className.split(' ')[1];
	// 	colorPalet.value=current.color;
	// 	myLog(dbMsg);
	// });
    //
	// socket.on('changeLineWidth', function(data) {
	// 	var dbMsg = "recive:changeLineWidth;";
	// 	current.width = data;
	// 	dbMsg += "="+current.width;
	// 	lineWidthSelect.value=current.width;
	// 	myLog(dbMsg);
	// });
    //
	// socket.on('changeLineCap', function(data) {
	// 	var dbMsg = "recive:changeLineCap;";
	// 	current.lineCap = data;
	// 	dbMsg += "="+current.lineCap;
	// 	lineCapSelect.value=current.lineCap;
	// 	myLog(dbMsg);
	// });

	socket.on('allclear', function(data) {
		dbMsg += "recive:all clear";
		myLog(dbMsg);
		allClear();
	});

  window.addEventListener('resize', onResize, false);
  onResize();

//イベント反映
	function onMouseDown(e) {
		var dbMsg = "onMouseDown;drawing=" + drawing;
		drawing = true;
		current.x = e.clientX;
		current.y = e.clientY;
		dbMsg = "(" + current.x + " , " + current.y + ")";
		drawLine( current.x,  current.y, current.x, current.y, current.color , current.width , current.lineCap , 0 , true);
          //htmlの場合は不要、Androidネイティブは書き出しでパスを生成するので必要
          //一点しかないので始点終点とも同じ座標を渡すし
		myLog(dbMsg);
	}

	function onMouseUp(e) {
		var dbMsg = "onMouseUp;drawing=" + drawing;
		if (drawing) {
			drawing = false;
			var currentX = current.x;
			var currentY = current.y;
			dbMsg = "(" + currentX + " , " + currentY + ")";
			current.x = e.clientX;
			current.y = e.clientY;
			dbMsg += ",color=" + current.color+ ",width=" + current.width;
			drawLine(currentX, currentY, current.x, current.y, current.color , current.width , current.lineCap , 2 , true);
		}
		myLog(dbMsg);
	}

	function onMouseMove(e) {
		var dbMsg = "onMouseMove(" + drawing;
		if (drawing) {
			dbMsg += ",color=" + current.color+ ",width=" + current.width;
			drawLine(current.x, current.y, e.clientX, e.clientY, current.color,current.width , current.lineCap ,1, true);
			current.x = e.clientX;
			current.y = e.clientY;
			dbMsg = ">>(" + current.x + " , " + current.y + ")";
		}
		myLog(dbMsg);
	}

  //スマホタッチ対応；	http://tokidoki-web.com/2015/08/html5%E3%81%A8javascript%E3%81%A7%EF%BD%90%EF%BD%83%E3%83%BB%E3%82%B9%E3%83%9E%E3%83%9B%E3%81%AE%E3%83%9E%E3%83%AB%E3%83%81%E3%82%BF%E3%83%83%E3%83%81%E5%AF%BE%E5%BF%9C%E3%81%97%E3%81%A6%E3%82%84///////
	canvas.ontouchstart = function(event) { //画面に指が触れた
		var dbMsg = "ontouchstart(" + drawing;
		drawing = true;
		var toucheX = event.touches[0].pageX; //タッチしている湯便の本数文、イベントは発生する
		var toucheY = event.touches[0].pageY;
		dbMsg += "(" + toucheX + " , " + toucheY + ")";
		current.x = toucheX;
		current.y = toucheY;
		drawLine( current.x,  current.y, current.x, current.y, current.color , current.width , current.lineCap , 0 , true);
		myLog(dbMsg);
	};

	canvas.ontouchmove = function(event) { //画面に指を触れたまま動かした
		dbMsg = "ontouchmove;drawing=" + drawing;
		if (drawing) {
			event.preventDefault(); // 画面のスクロールを防止する
			var toucheX = event.touches[0].pageX;
			var toucheY = event.touches[0].pageY;
			dbMsg += "(" + toucheX + " , " + toucheY + ")";
			dbMsg += ",color=" + current.color+ ",width=" + current.width;
			drawLine(current.x, current.y, toucheX, toucheY, current.color, current.width , current.lineCap , 2,true);
			current.x = toucheX;
			current.y = toucheY;
		}
		myLog(dbMsg);
	};

	canvas.ontouchend = function(event) { //画面から指を離した
		dbMsg = "ontouchend;drawing=" + drawing;
		if (drawing) {
			drawing = false;
			var currentX = current.x;
			var currentY = current.y;
			dbMsg += "(" + currentX + " , " + currentY + ")";
			var toucheX = event.touches[0].pageX;
			var toucheY = event.touches[0].pageY;
			dbMsg += "～(" + toucheX + " , " + toucheY + ")";
			current.x = toucheX;
			current.y = toucheY;
			dbMsg += ",color=" + current.color+ ",width=" + current.width;
			drawLine(currentX, currentY, current.x, current.y, current.color,current.width , current.lineCap ,1, true);
		}
		myLog(dbMsg);
	};

	//drawingで受信したデータを書き込む/////////////////////////////////////イベント反映
	function onDrawingEvent(data) {
		var w = canvas.width;
		var h = canvas.height;
		dbMsg = "onDrawingEvent；受信(" + data.x0 + " , " + data.y0 + ")";
		dbMsg += "～(" + data.x1 + " , " + data.y1 + ")";
		if ( data.x0 != data.x1 ) {
			dbMsg += "変位(" + (data.x0 - data.x1);
		}
		if ( data.y0 != data.y1 ) {
			dbMsg += "," + (data.y0 - data.y1) + ")";
		}
		dbMsg += ",color=" + data.color+ ",width=" + data.width+ ",lineCap=" + data.lineCap+ ",action=" + data.action;
		drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color , data.width , data.lineCap , data.action , false);
		myLog(dbMsg);
	}


  // make the canvas fill its parent
	function onResize() {
		dbMsg = "onResize;";
		canvas.width = window.innerWidth;
		dbMsg = "[" + canvas.width;
		var setHight = canvas.width*1080/1920;
		dbMsg = " , " + setHight + "]";
		canvas.height = setHight;			//window.innerHeight;
		myLog(dbMsg);
	}

	///実働部///////////////////////////////////////////////////////////////////////
	function throttle(callback, delay) {
		var previousCall = new Date().getTime();
		return function() {
			var time = new Date().getTime();

			if ((time - previousCall) >= delay) {
				previousCall = time;
				callback.apply(null, arguments);
			}
		};
	}

//自画面のcanvaseに書き込み、指定が有れば送信
	function drawLine(x0, y0, x1, y1, _color ,_width ,_lineCap,action, emit) {
		var dbMsg = "drawLine(" + x0 + " , " + y0 + ")";
		dbMsg += "～(" + x1 + " , " + y1 + ")";
		if ( x0 != x1 ) {
			dbMsg += "変位(" + (x0 - x1);
		}
		if ( y0 != y1 ) {
			dbMsg += "," + (y0 - y1) + ")";
		}
		context.beginPath();
		context.moveTo(x0, y0); //サブパスの開始点
		context.lineTo(x1, y1); //直前の座標と指定座標を結ぶ直線を引く
		dbMsg += "color=" + _color;
		context.strokeStyle = _color;
		dbMsg += ">>context=" + context.strokeStyle;

		dbMsg += ",width=" + _width;
		context.lineWidth = _width;
		dbMsg += ">>context=" + context.lineWidth;

		dbMsg += ",lineCap=" + _lineCap;
		context.lineCap = _lineCap;
		dbMsg += ">>context=" + context.lineCap ;

		dbMsg +=",action=" + action;
		context.stroke();
		context.closePath();

		dbMsg +=",emit=" + emit;
		if (emit) {
			var w = canvas.width;
			var h = canvas.height;
			socket.emit('drawing', {
				x0: x0 / w,
				y0: y0 / h,
				x1: x1 / w,
				y1: y1 / h,
				color: context.strokeStyle,
				width: current.width,
				lineCap:context.lineCap,
				action:action
			});
		}
		myLog(dbMsg);
	}

	function allClear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		dbMsg = "allClear";
		myLog(dbMsg);
	}

	myLog(dbMsg);

	var isDebug =true;
	function myLog(dbMsg) {
		if(isDebug){
			console.log(dbMsg);
			eventComent.innerHTML = dbMsg;
		}
	}

 }

)();
