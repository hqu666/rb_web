'use strict';

(function() {
	var socket = io();
	var canvas = document.getElementsByClassName('whiteboard')[0];				//描画領域
	var typeSelect = document.getElementById('typeSelect');						//描画種別
	var colorPalet = document.getElementById('colorPalet');						//カラーパレット
	var editerAria = document.getElementById('editerAria');						//上記の編集パーツ
	var scoreBrock = document.getElementById('scoreBrock');						//スコア表示
	var jobSelect = document.getElementById('jobSelect');						//元データの作り方
	var orgComp = document.getElementById('orgComp');							//元データの描画結果
	var useComp = document.getElementById('useComp');							//トレース後の描画結果

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
	var directionVal = 0;														//回転宝庫儒
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
		var dbMsg = "[jobSelect]";
		var currentjob =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",currentjob="+ currentjob;
		scoreBrock.style.display="none";
		editerAria.style.display="none";
		myLog(dbMsg);
		if(currentjob == "fileSel"){			//ファイルから読み込み</option>
			alert( '作成中です。');  //数値と文字の結合
		}else if(currentjob == "patranList"){			//パターンリスト表示</option>
			isComp=false;				//比較中
			document.getElementById("allclear").click();
			stereoTypeStart();
		}else if(currentjob == "make"){			//">作成</option>
		 	isComp=false;				//比較中
			document.getElementById("allclear").click();
			editerAria.style.display="inline-block";
			current.color =orgColor;			 // current.color = e.target.className.split(' ')[1];
		}else if(currentjob == "comp"){			//確定</option>
			orgComp.click();
			// editerAria.style.display="none";
			// this.close();
			// scoreStart();
		}else{			// <option value="line">作成</option>
			alert( '作成中です。');  //数値と文字の結合
		}
	}

	orgComp.onclick = function () {											//元データの描画結果
		var dbMsg = "[orgComp]";
		editerAria.style.display="none";
		$('#modalTitol').innerHTML = "元データを確認しています";
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		dbMsg += "["+ cWidth + "×"+ cHeight + "]";
		var lWidth=context.lineWidth;
		dbMsg += "lineWidth=" + lWidth;
		dbMsg += ",orgColo="+ orgColor;
		$('#modalComent').innerHTML = "["+ cWidth + "×"+ cHeight + "]を線幅" +lWidth+"で分割\n" ;
		$('#modal_box').modal('show');
		scoreStart();
		$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている

		jobSelect.value = 'comp';
	}

		useComp.onclick = function () {											//トレース後の描画結果
			var dbMsg = "[useComp]";
			$('#modalTitol').innerHTML = "トレースの確認";
			var cWidth = canvas.width;
			var cHeight = canvas.height;
			dbMsg += "["+ cWidth + "×"+ cHeight + "]";
			var lWidth=context.lineWidth;
			dbMsg += "lineWidth=" + lWidth;
			dbMsg += ",orgColo="+ orgColor;
			$('#modalComent').innerHTML =  "を線幅" +lWidth+"で分割\n" ;
			$('#modal_box').modal('show');
			scoreDrow();
			$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている

			jobSelect.value = 'comp';
		}

//変種ツール//////////////////////////////////////////////////////////////////
	typeSelect.onchange = function () {					 //描画する種類を変更
		var dbMsg = "typeSelect;";
		var currenttype =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",typeSelect="+ currenttype;
		if(currenttype == "free"){
			texeOptions.style.display="none";
			graficOptions.style.display="border-box";
		}else if(currenttype == "colorpic"){				//			<option value="">カラーピッカー</option>
			colorPick();
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
		var dbMsg = "colorPalet;";
		current.color =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",selectColor="+ current.color;
		// socket.emit('changeColor', current.color);
		myLog(dbMsg);
	}

	lineWidthSelect.onchange = function () {
		var dbMsg = "lineWidthSelect;";
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

	document.getElementById('directionSelect').onchange = function () {				//回転方向
		var dbMsg = "[typeSelect]";
		directionVal = this.value
		dbMsg += ",回転方向="+ directionVal;
		// socket.emit('changeLineCap', current.lineCap);
		myLog(dbMsg);
	}

	document.getElementById("allclear").onclick = function() {
		allClear();
		socket.emit('allclear', {});
	}

//イベント受信////////////////////////////////////////////////////////////////////////////
	socket.on('drawing', function(data) {
		var dbMsg = "recive:drawing";
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
		var dbMsg = "recive:all clear";
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
		var dbMsg = "[onMouseUp]drawing=" + drawing;
		if (drawing) {
			drawing = false;
			var currentX = current.x;
			var currentY = current.y;
			dbMsg = "(" + currentX + " , " + currentY + ")";
			current.x = e.clientX;
			current.y = e.clientY;
			dbMsg += ",color=" + current.color+ ",width=" + current.width;
			drawLine(currentX, currentY, current.x, current.y, current.color , current.width , current.lineCap , 2 , true);
			dbMsg += ",isComp=" + isComp;
			if(isComp){			//比較中
				useComp.click();
			}
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
		var dbMsg = "[ontouchmove]drawing=" + drawing;
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
		var dbMsg = "ontouchend;drawing=" + drawing;
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
		dbMsg = "[ontouchend]isComp=" + isComp;
		// if(isComp){			//比較中
		// 	scoreDrow();
		// }
		myLog(dbMsg);
	};

	//drawingで受信したデータを書き込む/////////////////////////////////////イベント反映
	function onDrawingEvent(data) {
		var w = canvas.width;
		var h = canvas.height;
		var dbMsg = "onDrawingEvent；受信(" + data.x0 + " , " + data.y0 + ")";
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
		var dbMsg = "onResize;";
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
			// var imagedata = context.getImageData(x0, y0,  x1, y1,);				//  指定座標のImageDataオブジェクトの取得
			// //  RGBAの取得
			// var cRed = imagedata.data[0];
			// var cGreen = imagedata.data[1];
			// var cBule = imagedata.data[2];
			// var cAlpha = imagedata.data[3];
			// dbMsg += ",r="+ cRed+",g="+ cGreen+",b="+ cBule+",a="+ cAlpha;
			// if(oRed == cRed && oGreen == cGreen && oBule == cBule){
			// 	compCount--;
			// 	dbMsg +=",compCount=" + compCount+"/" + orgCount;
			// 	var score =100;
			// 	if(0<compCount){
			// 		 score =  Math.round((orgCount-compCount)/orgCount*100);
			// 	}
			// 	dbMsg +="；score=" + score;
			// 	document.getElementById('scoreTF').innerHTML = score+"";
			// }
		}else{
			// orgCount++;
			// dbMsg +="；orgCount=" + orgCount;
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
		var dbMsg = "allClear";
		orgCount=0;
		myLog(dbMsg);
	}

	function colorPick() {
		canvas.addEventListener('mousemove', colorPickBody);
	}

	function colorPickBody(event) {
	  var x = event.layerX;
	  var y = event.layerY;
	  var pixel = context.getImageData(x, y, 1, 1);
	  var data = pixel.data;
	  var rgba = 'rgba(' + data[0] + ',' + data[1] +',' + data[2] + ',' + (data[3] / 255) + ')';
	  // document.getElementById('eventComent').style.background =  rgba;
	  var cColor = rgb2hex("rgb("+  data[0] + ", " +  data[1] + ", " +  data[2] +")");
	  document.getElementById('eventComent').textContent = rgba + "("+ cColor+ ")";
	}
//ファイル操作//////////////////////////////////////////
/**
* 定型パターンを画像で読込む（選択機構）
*/
	function stereoTypeStart() {
	    var tag = "[stereoTypeStart]";
		var dbMsg = tag ;
		document.getElementById("allclear").click();
		editerAria.style.display="inline-block";
		document.getElementById("modalTitol").innerHTML = "定型パターン選択";
		document.getElementById("modalComent").innerHTML = "トレース元にする図形クリックして下さい。";
		document.getElementById("modalImgList").style.display="inline-block";			 // 編集ツール表示
		document.getElementById("progressBase").style.display="none";
		$('#modal_box').modal('show');

		myLog(dbMsg);
	}

	document.getElementById("modalImgList").onclick = function (event) {					 // カラーパレットからの移し替え
	// function stereoTypeSelect() {
		 var tag = "[modalImgList]";
		 var $getListAItems = document.getElementById( "modalImgList" ).children;
	     for( var $i = 0; $i < $getListAItems.length; $i++ ){
	         $getListAItems[$i].onclick =function(){
					 var srcName =this.src;			 // current.color = e.target.className.split(' ')[1];
				 	var dbMsg = tag + ",src=" + srcName;
				 	myLog(dbMsg);
					$('#modal_box').modal('hide');
				 	bitmapRead(srcName);
	             };
	     }
	}

	/**
	 * 定型静止画を読み込む
	 * @param {*} srcName 型の画像ファイル名
	 */
	function bitmapRead(srcName) {
	    var tag = "[bitmapRead]";
	    var img = new Image();
	    img.src = srcName;
	    var dbMsg = tag + ",src=" + img.src;
	    img.crossOrigin = "Anonymous"; //XAMPP必要；file;//ではcrossdomeinエラー発生
	    img.onload = function(event) {
	        var dbMsg = tag + "[stereoTypeRead.onload]";
	        var dstWidth = this.width;
	        var dstHeight = this.height;
	        dbMsg = dbMsg + ",読み込んだ画像[" + dstWidth + "×" + dstHeight + "]Aspect=" + (dstWidth / dstHeight);
			var rectHead = document.getElementById('header').getBoundingClientRect();				//canvasの上にある要素
			var rect = document.getElementById('hitarea').getBoundingClientRect();
			var canvasX =rect.left + window.pageXOffset;
			var canvasY = rectHead.height			//rect.top + window.pageYOffset;は0しか取得できない
			dbMsg = dbMsg + ",tbCanvas(" + canvasX + " , " + canvasY + ")[" + rect.width + "×" + rect.height +"]";
	        var tbCanvasWidth = canvas.width;
	        var tbCanvasHeight = canvas.height;
	        dbMsg = dbMsg + "[" + tbCanvasWidth + "×" + tbCanvasHeight + "]";
	        var scaleWidth =  tbCanvasWidth/dstWidth*0.9;		//dstWidth / tbCanvasWidth;
	        var scaleHeight = tbCanvasHeight/dstHeight*0.9;	//dstHeight / tbCanvasHeight;
	        dbMsg = dbMsg + ",scale[" + scaleWidth + "×" + scaleHeight + "%]";	//"更に" + tileBaceSize + "%";
	        var biScale = scaleWidth;
	        if (scaleHeight < scaleWidth) {
	            biScale = scaleHeight;
	        }
	        dbMsg = dbMsg + ",拡大；" + biScale + "%";
	        dstWidth = dstWidth * biScale;
	        dstHeight = dstHeight * biScale;
	        dbMsg = dbMsg + ",表示[" + dstWidth + "×" + dstHeight + "]=" + (dstWidth / dstHeight);
	        var shiftX =( canvasX+tbCanvasWidth - dstWidth) / 2;				// (winW - dstWidth) / 2;
	        var shiftY = (canvasY+tbCanvasHeight - dstHeight) / 2;				//(winH - dstHeight) / 2;
			dbMsg += "directionVal=" + directionVal;
			if(directionVal == 8){
				dbMsg += "上下反転";
				shiftY =0;				//(winH - dstHeight) / 2;
			}

	        dbMsg = dbMsg + ",(" + shiftX + "," + shiftY + ")";
			myLog(dbMsg);
	        context.drawImage(this, shiftX, shiftY, dstWidth, dstHeight);
			// document.getElementById('header').style.display = "none";
			canvasSubstitution(canvas ,directionVal);
			 stereoTypeCheck(canvas)
			jobSelect.value = 'comp';
			// scoreStart();
			// document.getElementById('header').style.display = "block";
	    }
	}

	/**
	*①画像をピクセルにぽ機変える。
	*②指定されたCanvacs内のビットマップを指定方向に置き換える。
	* @param {*} canvas 捜査対象
	* @param {*} direction 置換え方向　0：そのまま　、　1;鏡面（上下）
	*/
	function canvasSubstitution(canvas ,direction) {
	    var tag = "[canvasSubstitution]";
		var dbMsg = tag + "[" +  canvas.width +"×" + canvas.width + "]direction="+direction;
		var context = canvas.getContext('2d');
		var canvasImageData = context.getImageData(0, 0, canvas.width, canvas.height);
		var canvasRGBA = canvasImageData.data;
		var newImageData = context.createImageData(canvas.width, canvas.height);
		var newRGBA = newImageData.data;
		var colorArray = new Array();
		oRed = 255;
		oGreen = 255;
		oBule = 255;

		context.lineWidth=0;
		var lineWidthMax = 0
		for (var yPos = 0;yPos < canvas.height;yPos++) {
			for (var xPos = 0;xPos < canvas.width;xPos++) {
				var carentPos =(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4);
				var mirrorInversion = (xPos * 4) + (yPos * canvas.width * 4);								//鏡面反転
				switch (direction) {
                    case 0:
						mirrorInversion = carentPos;
						break;
					case 8:
						break;
					}
				//org; newRGBA[(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4)] = canvasRGBA[(xPos * 4) + (yPos * canvas.width * 4)];
				newRGBA[carentPos] = canvasRGBA[mirrorInversion];
				newRGBA[1 + carentPos] = canvasRGBA[1 + mirrorInversion];
				newRGBA[2 + carentPos] = canvasRGBA[2 + mirrorInversion];
				newRGBA[3 + carentPos] = canvasRGBA[3 + mirrorInversion];
			}
		}
		context.putImageData(newImageData, 0, 0);					// コピーしたピクセル情報をCanvasに転送
		myLog(dbMsg);
	}
	// 上下反転		http://www.programmingmat.jp/webhtml_lab/canvas_image.html
	var bColor;
	/**
	* 使用されている色と線幅を取得
	* @param {*} canvas 捜査対象
	*/
	function stereoTypeCheck(canvas) {
	    var tag = "[stereoTypeCheck]";
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		var dbMsg = tag+"["+ cWidth + "×"+ cHeight + "]";
		var context = canvas.getContext('2d');
		var canvasImageData = context.getImageData(0, 0, canvas.width, canvas.height);
		var canvasRGBA = canvasImageData.data;
		var colorArray = new Array();
		var colorArray2 = new Array();
		oRed = 255;
		oGreen = 255;
		oBule = 255;
		bColor= rgb2hex("rgb("+ 255 + ", " + 255 + ", " + 255 +")");
		var lineWidth=0;
		var lineWidthMax = 0
		var checkCount = 0
		context.imageSmoothingEnabled = false;
	    context.mozImageSmoothingEnabled = false;
	    context.webkitImageSmoothingEnabled = false;
	    context.msImageSmoothingEnabled = false;
		// for (var i = 0;i < canvasRGBA.length;i+=4) {
		for (var yPos = 0;yPos < canvas.height;yPos++) {
			for (var xPos = 0;xPos < canvas.width;xPos++) {
				var carentPos =	(yPos*(canvas.width*4)) + (xPos*4);
				// var carentPos =(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4);
				var cRed = canvasRGBA[carentPos];					//canvasRGBA[carentPos];
				var cGreen = canvasRGBA[carentPos + 1];					//canvasRGBA[1 + carentPos];
				var cBule = canvasRGBA[carentPos + 2];					//canvasRGBA[2 + carentPos];
				var cAlpha =  canvasRGBA[carentPos + 3]/255;					//canvasRGBA[3 + carentPos];
				// if(cRed<255 && cGreen<255  && cBule<255 ){	//&& cAlpha == 1
				if((0 <cRed && cRed<255) &&	(0 <cGreen && cGreen<255)  && (0 <cBule && cBule<255) ){	//&& cAlpha == 1
					var cColor = rgb2hex("rgb("+ cRed + ", " + cGreen + ", " + cBule +")");
					// dbMsg += "("+ xPos + ","+ yPos + ")carentPos=" + carentPos +";" + cColor;
					if(bColor == cColor){
						lineWidth++;
						if(0<lineWidth){
							if(colorArray.length==0){
								oRed = cRed;
								oGreen = cGreen;
								oBule = cBule;
								// colorArray.push(cColor);
								colorArray[0]={ name:cColor, value:1 };
							}else{
								checkCount++;
								var rIndex = colorArray.filter(function(item, index){
								  if (item.name == cColor){
									var rObj = colorArray[index];
									var rValue = rObj['value']+1;
									colorArray[index]={ name:cColor, value:rValue };
									return index;
								  } else{
									// oRed = cRed;
  									// oGreen = cGreen;
  									// oBule = cBule;
									// colorArray[index+1]={ name:cColor, value:1 };
								  	// // return -1;
								  }
								});
							}
							if(colorArray2.indexOf(cColor) == -1){
								colorArray2.push(cColor);
								oRed = cRed;
								oGreen = cGreen;
								oBule = cBule;
								colorArray[colorArray.length]={ name:cColor, value:1 };
								lineWidth=0;
							}
						}
					}else{
						bColor = cColor;
						if(lineWidthMax < lineWidth){				//
							lineWidthMax = lineWidth;
						}
						lineWidth=0;
					}
				}else{
					lineWidth=0;
				}
			}			//xPos
		}				//yPos
		dbMsg += ">checkCount>"+checkCount;
		dbMsg += ">抽出色2>"+colorArray2.length +"色；";	// + colorArray.toString();
		dbMsg += ">抽出色>"+colorArray.length +"色；";	// + colorArray.toString();
		colorArray.sort( function(a, b) {
			 return a.value > b.value ? -1 : 1;
		 });
		orgColor = colorArray[0].name;			//rgb2hex("rgb("+ oRed + ", " + oGreen + ", " + oGreen +")");
		dbMsg += ">current.color>"+ orgColor;
		colorPalet.value=orgColor;
		current.color=orgColor;
		orgCount = colorArray[0].value;
		dbMsg += ">評価点>"+orgCount;
		document.getElementById('compTF').innerHTML = orgCount+"";
		document.getElementById('orgTF').innerHTML = orgCount+"";
		dbMsg += ">lineWidthMax>"+lineWidthMax;
		current.width = lineWidthMax;
		lineWidthSelect.value = lineWidthMax;
		scoreStartRady();

		myLog(dbMsg);
		document.getElementById('scoreComent').innerHTML = " 対象 "+orgColor + " ; " + colorArray.length +"色中";
		var rgba = 'rgba(' + oRed + ',' +oGreen +',' + oBule + ',' + (255 / 255) + ')';
		document.getElementById('scoreComent').style.background =  rgba;		//r=63,g=72,b=204 ="#3fcc48が正解

		scoreBrock.style.display="inline-block";			//BD
	}

	var oRed;
	var oGreen;
	var oBule;
	function scoreStartRady() {
		var dbMsg = "[scoreStartRady]";
		isComp=true;				//比較中
		editerAria.style.display="none";
		scoreBrock.style.display="inline-block";
		// orgCount=0;
		document.getElementById('scoreTF').innerHTML = 0+"";
		orgColor = current.color;
		dbMsg += ",selectColor="+ orgColor;
		 oRed =parseInt(orgColor.slice(1, 3),16);			//16新数；FFを10進数；255に
		 oGreen =parseInt(orgColor.slice(3,5),16);
		 oBule =parseInt(orgColor.slice(5,7),16);
		dbMsg += ",r="+ oRed+",g="+ oGreen+",b="+ oBule;
		var retRGB =complementary_color(oRed, oGreen, oBule);			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ">retRGB>"+ retRGB;		//rgb(255, 0, 255)
		compColor =rgb2hex(retRGB);
		current.color=compColor;
		dbMsg += ">>"+ current.color;
		myLog(dbMsg);
	}


	function scoreStart() {
		var dbMsg = "[scoreStart]";
		scoreStartRady();
		// isComp=true;				//比較中
		// editerAria.style.display="none";
		// scoreBrock.style.display="inline-block";
		// // orgCount=0;
		// document.getElementById('scoreTF').innerHTML = 0+"";
		// orgColor = current.color;
		// dbMsg += ",selectColor="+ orgColor;
		//  oRed =parseInt(orgColor.slice(1, 3),16);			//16新数；FFを10進数；255に
		//  oGreen =parseInt(orgColor.slice(3,5),16);
		//  oBule =parseInt(orgColor.slice(5,7),16);
		// dbMsg += ",r="+ oRed+",g="+ oGreen+",b="+ oBule;
		// var retRGB =complementary_color(oRed, oGreen, oBule);			 // current.color = e.target.className.split(' ')[1];
		// dbMsg += ">retRGB>"+ retRGB;		//rgb(255, 0, 255)
		// compColor =rgb2hex(retRGB);
		// current.color=compColor;
		// dbMsg += ">>"+ current.color;
		// orgCount =setTimeout(scoreCount,1000);
		orgCount =scoreCount(canvas , context.lineWidth , orgColor);
		$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている
		dbMsg += ",orgCount="+ orgCount;
		compCount = orgCount;
		document.getElementById('compTF').innerHTML = orgCount+"";
		document.getElementById('orgTF').innerHTML = orgCount+"";
		// const prom =scoreCount();
		// prom.then((orgCount) => {
		// 	dbMsg += ",orgCount="+ orgCount;
		// 	compCount = orgCount;
		// 	document.getElementById('compTF').innerHTML = orgCount+"";
		// 	document.getElementById('orgTF').innerHTML = orgCount+"";
		// }).catch((err) => {
		// 	dbMsg += "カウント失敗";
		// });
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
		var dbMsg = "[scoreDrow]";
		var score =100;
		// $('#modalTitol').innerHTML = "トレースの確認";
		// var cWidth = canvas.width;
		// var cHeight = canvas.height;
		// dbMsg += "["+ cWidth + "×"+ cHeight + "]";
		// var lWidth=context.lineWidth;
		// dbMsg += "lineWidth=" + lWidth;
		// dbMsg += ",orgColo="+ orgColor;
		// $('#modalComent').innerHTML =  "を線幅" +lWidth+"で分割\n" ;
		// $('#modal_box').modal();
		// compCount =setTimeout(scoreCount,1000);
		compCount =scoreCount(canvas , context.lineWidth , orgColor);
		dbMsg += "compCount"+ compCount;
		orgCount=document.getElementById('orgTF').innerHTML;
		dbMsg += "/"+ orgCount;
		 score =  Math.round((orgCount-compCount)/orgCount*100);
		 dbMsg +="；score=" + score;
		 document.getElementById('scoreTF').innerHTML = score+"";
		document.getElementById('compTF').innerHTML = compCount+"";
		// const prom =scoreCount();
		// prom.then((compCount) => {
		// 	dbMsg += ",compCount="+ compCount;
		// 	if(0<compCount){
		// 		orgCount=document.getElementById('orgTF').innerHTML;
		// 		dbMsg += "/"+ orgCount;
		// 		 score =  Math.round((orgCount-compCount)/orgCount*100);
		// 		 dbMsg +="；score=" + score;
		// 		 document.getElementById('scoreTF').innerHTML = score+"";
		// 		document.getElementById('compTF').innerHTML = compCount+"";
		// 		myLog(dbMsg);
		// }
		// }).catch((err) => {
		// 	dbMsg += "カウント失敗";
		// });
		myLog(dbMsg);
	}

	function scoreCount(canvas , lWidth , orgColor) {
		// return new Promise((onSuccess, onFailed) => {
			var dbMsg = "[scoreCount]";
			var dCount =0;
			// var lWidth=context.lineWidth;
			dbMsg += "lineWidth=" + lWidth;
			dbMsg += ",orgColo="+ orgColor;
			var cWidth = canvas.width;
			var cHeight = canvas.height;
			dbMsg += "["+ cWidth + "×"+ cHeight + "]";
			// $('body').addClass('modal-open');
			// $("#progressFleam").css("display", "block");
			// document.getElementById("progressFleam").style.display="block";
			// $('#modal_box').modal();
			// $('#modalTitol').innerHTML = "元データを確認しています";
			// $('#modalComent').innerHTML = "描画領域[" +cWidth+"×"+lWidth+ "]を線幅" +lWidth+"で分割\n" ;
			// $('#dlog_bt').click();			// $('#modal_box').modal(); が効かない

		// dispLoading("元データを確認しています");
			// showProg();
			// document.getElementById("modal_box").modal();//modal is not a function
			// document.getElementById("progress").style.display="block";
			// $('#progress').progressbar({
			//    value: 0,
			//    max: cWidth,
			//    disabled: false
			//  });
			for(var x = 0; x<cWidth; x+=lWidth  ){
				var pVar =Math.round(x/cWidth*100)+1;
				// $('#progress').progressbar({
				//    value: x,
				//  });
				//  $('#loading').text(pVar + '％');
				document.getElementById("progressBs").innerHTML =  String(pVar) + "%";
				// $(".progress-bar").css("width", String(pVar) + "%");		// $('.progressBs').css("width", String(pVar) + "%")では反映されない
				document.getElementById("progressBs").style.width =  String(pVar) + "%";
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
			// $('body').removeClass('modal-open'); // 1； body に自動的に付与されるクラスを削除する。このクラスがついたままだと、 画面スクロールが効かなくなる
			// $('.modal-backdrop').remove();       // 2；モーダルの背景（黒い部分）を削除する処理。この処理を行わないとモーダルは消えても、背景が残ったままになり、 クリックが効かないままになる
			// $('#modal_box').modal('hide');        // 3；モーダル自体を閉じている
			// document.getElementById("progressBs").style.display="none";
			// removeLoading();
//			document.getElementById("progressFleam").style.display="none";			 // ここでstyleは無効
			dbMsg += ">>>dCount=" + dCount;
			myLog(dbMsg);
			return dCount;
			// return onSuccess(dCount);
	    // });
	}

 	$('#dlog_bt').on('click', function(){
	// $('.click_btn').on('click', function(){
	  $('#modal_box').modal('show');

	});
	/* ------------------------------
	 Loading イメージ表示関数
	 引数： msg 画面に表示する文言
	 https://webllica.com/jquery-now-loading/
	 ------------------------------ */
	// function dispLoading(msg){
	//   // 引数なし（メッセージなし）を許容
	//   if( msg == undefined ){
	//     msg = "";
	//   }
	//   // 画面表示メッセージ
	//   var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
	//   // ローディング画像が表示されていない場合のみ出力
	//   if($("#loading").length == 0){
	//     $("body").append("<div id='loading'>" + dispMsg + "</div>");
	//   }
	// }
	//
	// /* ------------------------------
	//  Loading イメージ削除関数
	//  ------------------------------ */
	// function removeLoading(){
	//   $("#loading").remove();
	// }
	// //
	// // /* ------------------------------
	// //  非同期処理の組み込みイメージ
	// //  ------------------------------ */
	// // // // $(function () {
	// 	function showProg() {
	// 	  dispLoading("処理中...");	  // 処理前に Loading 画像を表示
	// 	  // 非同期処理
	// 	  $.ajax({
	// 		url : "サーバーサイドの処理を行うURL",
	// 		type:"GET",
	// 		dataType:"json"
	// 	  })
	// 	  // 通信成功時
	// 	  .done( function(data) {
	// 		showMsg("成功しました");
	// 	  })
	// 	  // 通信失敗時
	// 	  .fail( function(data) {
	// 		showMsg("失敗しました");
	// 	  })
	// 	  // 処理終了時
	// 	  .always( function(data) {
	// 		// Lading 画像を消す
	// 		removeLoading();
	// 	  });
	// 	});
	// // // // });
	// myLog(dbMsg);

	var isDebug =true;
	function myLog(dbMsg) {
		if(isDebug){
			console.log(dbMsg);
			eventComent.innerHTML = dbMsg;
		}
	}

 }
)();




//Canvas とピクセル操作	https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas
//上下反転	http://www.programmingmat.jp/webhtml_lab/canvas_image.html
