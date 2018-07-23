'use strict';

(function() {
	var dbMsg = "repi_brain.js;"
	var socket = io();
	var canvas = document.getElementsByClassName('whiteboard')[0];				//描画領域
	var typeSelect = document.getElementById('typeSelect');						//描画種別
	var colorPalet = document.getElementById('colorPalet');						//カラーパレット
	var editerAria = document.getElementById('editerAria');						//上記の編集パーツ
	var scoreBrock = document.getElementById('scoreBrock');						//スコア表示
	var jobSelect = document.getElementById('jobSelect');						//元データの作り方

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
	var isComp=false;				//比較中
	var orgCount=0;
	var compCount=0;
	var orgColor='#00FF00';
	var compColor='#FFFFFF';
	colorPalet.value=orgColor;
	lineWidthSelect.value= 10;				//current.width;
	current.width =  lineWidthSelect.value;
	current.lineCap =  "round";

	texeOptions.style.display="none";
	var drawing = false;


	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('mouseout', onMouseUp, false);
	canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  /////////////////////////////////////////////////////////////////////////////
	jobSelect.onchange = function () {					 //描画する種類を変更
		dbMsg = "jobSelect;";
		var currentjob =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",currentjob="+ currentjob;
		scoreBrock.style.display="none";
		editerAria.style.display="none";
		if(currentjob == "fileSel"){			//ファイルから読み込み</option>
			alert( '作成中です。');  //数値と文字の結合
		}else if(currentjob == "patranList"){			//パターンリスト表示</option>
			alert( '作成中です。');  //数値と文字の結合
		}else if(currentjob == "make"){			//">作成</option>
		 	isComp=false;				//比較中
			document.getElementById("allclear").click();
			editerAria.style.display="inline-block";
			current.color =orgColor;			 // current.color = e.target.className.split(' ')[1];
		}else if(currentjob == "comp"){			//確定</option>
			editerAria.style.display="none";
			scoreStart();
		}else{			// <option value="line">作成</option>
			alert( '作成中です。');  //数値と文字の結合
		}
		  myLog(dbMsg);
	}

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
			// scoreDrow();
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
		var dbMsg = "[drawLine](" + x0 + " , " + y0 + ")"+_color;
		dbMsg += "～(" + x1 + " , " + y1 + ")";
		if ( x0 != x1 ) {
			dbMsg += "変位(" + (x0 - x1);
		}
		if ( y0 != y1 ) {
			dbMsg += "," + (y0 - y1) + ")";
		}
		dbMsg += ",isComp="+ isComp;
		if(isComp){			//比較中
			_color = compColor;
			var imagedata = context.getImageData(x0, y0,  x1, y1,);				//  指定座標のImageDataオブジェクトの取得
			//  RGBAの取得
			var cRed = imagedata.data[0];
			var cGreen = imagedata.data[1];
			var cBule = imagedata.data[2];
			var cAlpha = imagedata.data[3];
			dbMsg += ",r="+ cRed+",g="+ cGreen+",b="+ cBule+",a="+ cAlpha;
			if(oRed == cRed && oGreen == cGreen && oBule == cBule){
				compCount--;
				dbMsg +=",compCount=" + compCount+"/" + orgCount;
				var score =100;
				if(0<compCount){
					 score =  Math.round((orgCount-compCount)/orgCount*100);
				}
				dbMsg +="；score=" + score;
				document.getElementById('scoreTF').innerHTML = score+"";
			}
		}else{
			orgCount++;
			dbMsg +="；orgCount=" + orgCount;

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
		orgCount=0;
		myLog(dbMsg);
	}

	var oRed;
	var oGreen;
	var oBule;
	function scoreStart() {
		dbMsg = "[scoreStart]";
		isComp=true;				//比較中
		scoreBrock.style.display="inline-block";
		// orgCount=0;
		document.getElementById('scoreTF').innerHTML = 0+"";
		orgColor = current.color;
		dbMsg += ",selectColor="+ orgColor;
		 oRed =parseInt(orgColor.slice(1, 3),16);
		 oGreen =parseInt(orgColor.slice(3,5),16);
		 oBule =parseInt(orgColor.slice(5,7),16);
		dbMsg += ",r="+ oRed+",g="+ oGreen+",b="+ oBule;
		var retRGB =complementary_color(oRed, oGreen, oBule);			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ">retRGB>"+ retRGB;		//rgb(255, 0, 255)
		compColor =rgb2hex(retRGB);
		current.color=compColor;
		dbMsg += ">>"+ current.color;
		orgCount=scoreCount();
		dbMsg += ",orgCount="+ orgCount;
		compCount = orgCount;
		myLog(dbMsg);
	}

/**
* Illustrator の計算方法		https://q-az.net/complementary-color-javascript/
*/
	function complementary_color(R, G, B) {
	    //各値全てが数値かつ0以上255以下
	    if(!isNaN(R + G + B) && 0 <= R && R <=255 && 0 <= G && G <=255 && 0 <= B && B <=255) {
			//最大値、最小値を得る
	        var max = Math.max(R, Math.max(G, B));
	        var min = Math.min(R, Math.min(G, B));
	        var sum = max + min;	        //最大値と最小値を足す
	        //R、G、B 値を和から引く
	        var newR = sum - R;
	        var newG = sum - G;
	        var newB = sum - B;
	        var comColor = "rgb("+ newR + ", " + newG + ", " + newB +")";

	        //文字列を返す
	        return comColor;
	    } else {

	        //if 条件から外れた場合は null を返す
	        return null;
	    }
	}

	function rgb2hex ( col ) {
		return "#" + col.match(/\d+/g).map(function(a){return ("0" + parseInt(a).toString(16)).slice(-2)}).join("");
	}

	function scoreDrow() {
		dbMsg = "[scoreDrow]";
		dbMsg += "orgCount="+orgCount;
		var compCount=scoreCount();
		var score =100;
		if(0<compCount){
			 score =  Math.round((orgCount-compCount)/orgCount*100);
		}
		dbMsg +="；score=" + score;
		myLog(dbMsg);
	}

	function scoreCount() {
		dbMsg = "[scoreCount]";
		var dCount =0;
		var lWidth=context.lineWidth;
		dbMsg += "lineWidth=" + lWidth;
		dbMsg += ",orgColo="+ orgColor;
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		dbMsg += "["+ cWidth + "×"+ cHeight + "]";
	dispLoading("元データを確認しています");
		// showProg();
		// document.getElementById("progressBs").style.display="block";
		for(var x = 0; x<cWidth; x+=lWidth  ){
			var pVar =Math.round(x/cWidth*100);
			// document.getElementById("progressBs").style.width=pVar;
			for(var y = 0; y<cHeight ;y+=lWidth  ){
				var imagedata = context.getImageData(x, y, lWidth, lWidth);				//  指定座標のImageDataオブジェクトの取得
				//  RGBAの取得
				var cRed = imagedata.data[0];
				var cGreen = imagedata.data[1];
				var cBule = imagedata.data[2];
				var cAlpha = imagedata.data[3];
				if(oRed == cRed && oGreen == cGreen && oBule == cBule){
					dbMsg += "("+ x + ","+ y + ")";
					dbMsg += ",r="+ cRed+",g="+ cGreen+",b="+ cBule+",a="+ cAlpha;
					dCount++;
				}
			}
		}
		// document.getElementById("progressBs").style.display="none";
		removeLoading();

		dbMsg += ">>>dCount=" + dCount;
		myLog(dbMsg);
		return dCount;
	}

	/* ------------------------------
	 Loading イメージ表示関数
	 引数： msg 画面に表示する文言
	 https://webllica.com/jquery-now-loading/
	 ------------------------------ */
	function dispLoading(msg){
	  // 引数なし（メッセージなし）を許容
	  if( msg == undefined ){
	    msg = "";
	  }
	  // 画面表示メッセージ
	  var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
	  // ローディング画像が表示されていない場合のみ出力
	  if($("#loading").length == 0){
	    $("body").append("<div id='loading'>" + dispMsg + "</div>");
	  }
	}

	/* ------------------------------
	 Loading イメージ削除関数
	 ------------------------------ */
	function removeLoading(){
	  $("#loading").remove();
	}
	//
	// /* ------------------------------
	//  非同期処理の組み込みイメージ
	//  ------------------------------ */
	// // // $(function () {
		function showProg() {
		  dispLoading("処理中...");	  // 処理前に Loading 画像を表示
		  // 非同期処理
		  $.ajax({
			url : "サーバーサイドの処理を行うURL",
			type:"GET",
			dataType:"json"
		  })
		  // 通信成功時
		  .done( function(data) {
			showMsg("成功しました");
		  })
		  // 通信失敗時
		  .fail( function(data) {
			showMsg("失敗しました");
		  })
		  // 処理終了時
		  .always( function(data) {
			// Lading 画像を消す
			removeLoading();
		  });
		});
	// // // });
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
