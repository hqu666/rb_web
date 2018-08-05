'use strict';

(function() {
	var isDebug =true;
	var isSmaphoDebug =false;
	var socket = io();
	var ua =navigator.userAgent;
	var isMobile=false;				//現在使用しているのはスマホ
	var srcName="";																	//トレース元のファイル名
	var canvas = document.getElementsByClassName('whiteboard')[0];				//描画領域
	var jobSelect = document.getElementById('jobSelect');						//元データの作り方
	jobSelect.options[0].disabled = true;										//>選択して下さい
    jobSelect.options[4].disabled = true;										//もう一度
	var typeSelect = document.getElementById('typeSelect');						//描画種別
	typeSelect.options[6].disabled = true;										//確定
	var colorPalet = document.getElementById('colorPalet');						//カラーパレット
	var editerAria = document.getElementById('editerAria');						//上記の編集パーツ
	var scoreBrock = document.getElementById('scoreBrock');						//スコア表示

	var orgComp = document.getElementById('orgComp');							//元データの描画結果
	var useComp = document.getElementById('useComp');							//判定ボタン；トレース後の描画結果
	useComp.style.display="none";												//判定ボタン

	var graficOptions = document.getElementById('graficOptions');				//グラフィック設定
	var lineWidthSelect = document.getElementById('lineWidthSelect');			//線の太さ
	var lineCapSelect = document.getElementById('lineCapSelect');				//先端形状

	var texeOptions = document.getElementById('texeOptions');					//テキスト設定
	var eventComent = document.getElementById("eventComent");
	// eventComent.innerHTML = "";				//"Drow OK";
	var $document = $(document);
	var $hitarea = $('#whiteboard');
	var context = canvas.getContext('2d');
	var current = {
		color:'#00FF00',
		width:'1',
		lineCap:"round"										//butt, round, square
	};
	var isMirror=false;				//上下鏡面動作
	var is_h_Mirror=false;				//左右鏡面動作
	var isAutoJudge=true;				//トレース後に自動判定
	var isComp=false;				//比較中	;scoreStartRadyでtrueに設定
	var orgCount=0;
	var compCount=0;
	var currentWidth=10;
	var currentLineCap="round";
	var directionVal = 0;														//回転宝庫儒
	var orgColor='#00ff00';
	var compColor='#ffffff';
	var oRed;
	var oGreen;
	var oBule;
	colorPalet.value=orgColor;
	lineWidthSelect.value= 10;				//currentWidth;
	currentWidth =  lineWidthSelect.value;
	// currentLineCap =  "round";

	texeOptions.style.display="none";
	var drawing = false;
	var canvasRect = document.getElementById('hitarea').getBoundingClientRect();
	var canvasX =canvasRect.left + window.pageXOffset;
	var canvasY = canvasRect.top+ window.pageYOffset;			//canvasRect.top = 110
	var canvasWidth = canvasRect.width;
	var canvasHeight = canvasRect.height;
	var originPixcel;


	function myLog(dbMsg) {
		if(isDebug){
			console.log(dbMsg);
			eventComent.innerHTML = dbMsg;
		}
	}

	function mobileLog(dbMsg) {
		if(isMobile & isSmaphoDebug){
			alert(dbMsg);
		}
	}
	/**
	 *2桁にして返す
	 */
	function towFigures(iVal) {
		var dbMsg = "[towFigures]"
		dbMsg += ",iVal=" + iVal;
		var retStr = "";
		if (iVal < 10) {
			retStr = "0" + iVal;
		} else {
			retStr = "" + iVal;
		}
		dbMsg += ",retStr=" + retStr;
		myLog(dbMsg);
		return retStr;
	}

	function retNowStr() {
		var dbMsg = "[retNowStr]";
		var s_time = ""; // "?sesion="
		var now = new Date();
		var rInt = "" + now.getYear();
		if ("1" == rInt.substring(0, 1)) {
			s_time += "20" + rInt.substring(1, rInt.length);
		}
		s_time += "" + towFigures((now.getMonth() + 1)) + towFigures(now.getDate() + 0) + towFigures(now.getHours()) +
			towFigures(now.getMinutes()) + towFigures(now.getSeconds()); // "?sesion="
		dbMsg += "　,s_time=" + s_time; //,UrlPparam=?sesion=11872218750　,wifiURL=http://192.168.3.10
		return s_time;
	}

	var roomVal = retNowStr();
	var room =  socket.connect("127.0.0.1:3080/" + roomVal);				// = io.connect("http://localhost:3000/room1");
	/**
	*連想配列の既存位置検索
	*/
	function getArryPosition(fArray ,fal ){
	    var dbMsg = "[getArryPosition]" ;
	     dbMsg += "fArray=" + fArray.length +"件";
	     dbMsg += "で" + fal +"を検索";
	    var sPosition = -1;
	    for(var i=0 ;i< fArray.length-1;i++){
	        if( fArray[i].name == fal){
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
	function getArrayVal(fArray,fal ,rVal ){
	    var dbMsg = "[getArrayVal]fal=" + fal;
	    dbMsg += ",roomVal=" + rVal;
	    var sPosition = getArryPosition(fArray ,fal );
	    dbMsg += "(" + sPosition +")";
	    if(-1 < sPosition){
	        rVal = fArray[sPosition].value;			//rgb2hex("rgb("+ oRed + ", " + oGreen + ", " + oGreen +")");
	        dbMsg += "既存";
	    } else if(rVal != ""){
	        fArray[fArray.length]={ name:fal, value:rVal };		//カウント付きの連想配列にも要素追加
	        dbMsg += ">追加" + fArray.length + "件目" ;
	    }else{
	        dbMsg += ">skip" ;
	    }
	    // myLog(dbMsg);
	    return rVal;
	}
/**
* URLのパラメータを取得
* http://www-creators.com/archives/4463
*/
	function getUrlParam(name, url) {
		var dbMsg = "[getUrlParam]";
		var results="";
		 dbMsg += "name=" + name;
		 dbMsg += "を" + url + " から取得";
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
		var params= url.split('?');
		dbMsg += "," + params.length + "件";
		for(var param of params){
			dbMsg += ",param=" + param;
			var rStrs = param.split('=');
			if(rStrs[0] == name){
				results = rStrs[1] ;
				break;
			}
		}
		dbMsg += ">>results>>" + results;
		// myLog(dbMsg);
		return results;
	}

	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	// canvas.addEventListener('mouseout', onMouseUp, false);
	canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
	// if(ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('iPod')  > -1|| ua.indexOf('Android')  > -1|| ua.indexOf('Mobile')  > -1){
	// 	isMobile = true;
	// 	// canvas.addEventListener('touchend', ontouchend, false);
	// 	// canvas.addEventListener('touchstart', touchHandler, false);
	// 	// canvas.addEventListener('touchmove', touchHandler, false);
	// 	canvas.addEventListener('touchend', touchHandler, false);		//true を指定すると、listener は一度実行された時に自動的に削除
	// }
	window.addEventListener('resize', onResize, false);
	onResize();

	window.addEventListener('load', function() {
		var dbMsg = "[repi_brain/onload]";
		var urlStr = location.href +"";
		dbMsg += ",urlStr=　"+urlStr;				//protocol + hostname + port + hash をまとめて取得
		if(-1 == urlStr.indexOf('127.0.0') && -1 == urlStr.indexOf('192.168')){
			isDebug =false;
			isSmaphoDebug =false;
		}
		var roomPostion = urlStr.indexOf('room');
		dbMsg += "　,room:Postion=" + roomPostion + "/" + urlStr.length;
		if (-1 < roomPostion) { //セッションコード済みなら
			roomVal = getUrlParam("room", urlStr);
			var params= urlStr.split('?');
			var setStr = params[0] + roomVal;
			dbMsg += ">io.connect>" + setStr;
		 	room = io.connect(setStr);
		}

		if (window.File && window.FileReader && window.FileList && window.Blob) {		//ファイル読込みが可能な環境なら
			dbMsg += " ,ファイル読込み可能";
			jobSelect.options[4].disabled = false;										//ファイルから読み込み　を有効化
			document.getElementById('files').addEventListener('change', handleFileSelect, false);
		} else {
			jobSelect.options[4].disabled = true;
		}
		document.getElementById('files').style.display="none";
		// canvasRect = document.getElementById('hitarea').getBoundingClientRect();
		// canvasX =canvasRect.left + window.pageXOffset;
		// canvasY = canvasRect.top+ window.pageYOffset;			//canvasRect.top = 110
		// dbMsg += ",canvas("+ canvasX + " , " + canvasY + ")";
	 	// var canvasWidth = canvasRect.width;
		// var canvasHeight = canvasRect.height;
		// dbMsg += "["+ canvasWidth + " × " + canvasHeight + "]";
		//  canvasHeight = canvasWidth*9/16;
		// dbMsg += ">>" + canvasHeight + "]";
		// document.getElementById('hitarea').style.height = canvasHeight;
		if(ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('iPod')  > -1|| ua.indexOf('Android')  > -1|| ua.indexOf('Mobile')  > -1){
			isMobile=true;				//現在使用しているのはスマホ
			canvas.addEventListener('touchend', touchHandler, false);		//true を指定すると、listener は一度実行された時に自動的に削除
			// window.directions=0;			//this,window	>>cannat CET;0
			// window.location = 0;
		}else{
			isMobile=false;
		}
		dbMsg += " ,isMobile="+isMobile;
		isMirror = document.getElementById('mirrorCB').checked;
		dbMsg += ",isMirror="+isMirror;
		is_h_Mirror = document.getElementById('mirror_h_CB').checked;
		dbMsg += ",is_h_Mirror="+is_h_Mirror;
		document.getElementById('compInfo').style.display="none";					//手書き完了後表示
		// dbMsg += ",socket="+socket.id;
		//
		// socket.emit('conect_start', {
		// 	nickname: "nick",
		// 	href:location.href +""
		// });
		var roomPostion = urlStr.indexOf('room');
		dbMsg += "　,roomPostion=" + roomPostion + "/" + urlStr.length;
		if (-1 < roomPostion) { //セッションコード未定；アクセス直後
			srcName ="/stereotype/st001.png";			 // current.color = e.target.className.split(' ')[1];
			dbMsg += ",src=" + srcName;
		   bitmapRead(srcName);
		}
		// mobileLog(dbMsg);
		myLog(dbMsg);
	});

	// window.addEventListener('resize', function() {
	// 	var dbMsg = "[repi_brain/resize]";
	// 	canvas.width = window.innerWidth;
	// 	dbMsg = "[" + canvas.width;
	// 	var setHight = canvas.width*1080/1920;
	// 	dbMsg = " , " + setHight + "]";
	// 	canvas.height = setHight;			//window.innerHeight;
	// 	myLog(dbMsg);
	// })
	function onResize() {
		var dbMsg = "onResize;";
		canvas.width = window.innerWidth;
		dbMsg += "[" + canvas.width;
		var setHight = canvas.width*1080/1920;
		dbMsg += " , " + setHight + "]";
		canvas.height = setHight;			//window.innerHeight;
		// myLog(dbMsg);
	}

  /////////////////////////////////////////////////////////////////////////////
	jobSelect.onchange = function () {					 //描画する種類を変更
		var dbMsg = "[jobSelect]";
		var currentjob =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",currentjob="+ currentjob;
		scoreBrock.style.display="none";
		editerAria.style.display="none";
		document.getElementById('files').style.display="none";
		document.getElementById('compInfo').style.display="none";					//手書き完了後表示
		myLog(dbMsg);
		if(currentjob == "none"){
		}else if(currentjob == "fileSel"){										//ファイルから読み込み
			document.getElementById('files').style.display="inline-block";
		}else if(currentjob == "patranList"){									//パターンリスト表示</option>
			isComp=false;				//比較中
			document.getElementById("allclear").click();
			stereoTypeStart();
		}else if(currentjob == "make"){											//"手書きで作成の場合
		 	isComp=false;														//比較中解除
			if(is_h_Mirror){														//鏡面動作になっていたら
				document.getElementById('mirror_h_CB').click();					//解除
			}
			if(isMirror){														//鏡面動作になっていたら
				document.getElementById('mirrorCB').click();					//解除
			}
			document.getElementById("allclear").click();						//画面を初期化して
			editerAria.style.display="inline-block";							//編集ツール表示
			current.color =orgColor;			 								//元パターン用の色に戻す
			document.getElementById('compInfo').style.display="inline-block";					//手書き完了後表示
		}else if(currentjob == "again"){			//もう一度</option>
			drowAgain();
		// }else if(currentjob == "comp"){			//確定</option>
		// 	orgComp.click();
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

		jobSelect.value = 'none';											//none		comp
		document.getElementById('compInfo').style.display="none";					//手書き完了後表示
		document.getElementById('editerAria').style.display="none";					//手書きツールパレット

	}

	/**
	*トレース後の描画結果
	*/
	useComp.onclick = function () {
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

		jobSelect.value = 'none';			//none		comp
	}

//編集ツール//////////////////////////////////////////////////////////////////
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
		}else if(currenttype == "comp"){			//確定</option>
			orgComp.click();
		}else{
			alert( '作成中です。');  //数値と文字の結合
			texeOptions.style.display="none";
			graficOptions.style.display="border-box";
		}
		typeSelect.value =  "free";
		myLog(dbMsg);
	}

	colorPalet.onchange = function () {					 // カラーパレットからの移し替え
		var dbMsg = "[colorPalet]";
		dbMsg += ",room=" + roomVal;
		current.color =this.value;			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ",selectColor="+ current.color;
		socket.emit('changeColor', {
			room : "/" + roomVal ,
			color:current.color
		});
		myLog(dbMsg);
	}

	lineWidthSelect.onchange = function () {
		var dbMsg = "[lineWidthSelect]";
		dbMsg += ",room=" + roomVal;
		var selectWidth = this.value
		currentWidth =  selectWidth;
		dbMsg += ",selectWidth="+ currentWidth;
		socket.emit('changeLineWidth', {
			room : "/" + roomVal ,
			width:currentWidth
		});
		myLog(dbMsg);
	}

	lineCapSelect.onchange = function () {				//先端形状
		var dbMsg = "[lineCapSelect]";
		dbMsg += ",room=" + roomVal;
		var lineCap = this.value
		currentLineCap =  lineCap;
		dbMsg += ",lineCap="+ currentLineCap;
		socket.emit('changeLineCap', {
			room : "/" + roomVal ,
			lineCap:currentLineCap
		});
		myLog(dbMsg);
	}

	document.getElementById('mirrorCB').onchange = function () {				//先端形状
		var dbMsg = "[mirrorCB]";
		dbMsg += ",room=" + roomVal;
		isMirror = document.getElementById('mirrorCB').checked;
		dbMsg += ",上下鏡面="+isMirror;
		myLog(dbMsg);
		socket.emit('setmirror', {
			room : "/" + roomVal ,
			bool:isMirror
		});
	}

	document.getElementById('mirror_h_CB').onchange = function () {				//先端形状
		var dbMsg = "[mirror_h_CB]";
		dbMsg += ",room=" + roomVal;
		is_h_Mirror = document.getElementById('mirror_h_CB').checked;
		dbMsg += ",左右鏡面="+is_h_Mirror;
		myLog(dbMsg);
		socket.emit('setmirror_h', {
			room : "/" + roomVal ,
			bool:is_h_Mirror
		});
	}

/**
*トレース後に自動判定
*/
	document.getElementById('autojudgeCB').onchange = function () {
		var dbMsg = "[autojudgeCB]";
		dbMsg += ",room=" + roomVal;
		isAutoJudge = document.getElementById('autojudgeCB').checked;
		dbMsg += ",isAutoJudge="+isAutoJudge;
		if(isAutoJudge){
			useComp.style.display="none";												//判定ボタン
		}else {
			useComp.style.display="inline-block";												//判定ボタン
		}
		myLog(dbMsg);
		socket.emit('setautojudge', {
			room : "/" + roomVal ,
			bool:isAutoJudge
		});
	}

	document.getElementById('directionSelect').onchange = function () {				//回転方向
		var dbMsg = "[typeSelect]";
		dbMsg += ",room=" + roomVal;
		directionVal = this.value
		dbMsg += ",回転方向="+ directionVal;
		myLog(dbMsg);
	}

	document.getElementById("allclear").onclick = function() {
		var dbMsg = "[allclear]";
		dbMsg += ",room=" + roomVal;
		allClear();
		myLog(dbMsg);
		socket.emit('allclear', {									//socket		room
			room:"/"+roomVal
		});
	}

//socket.ioイベント受信////////////////////////////////////////////////////////////////////////////
	socket.on('drawing', function(data) {				//socket.on('drawing', function(data)
		var dbMsg = "recive:drawing";
		onDrawingEvent(data);
		myLog(dbMsg);
	});

	socket.on('drawend', function(data) {
		var dbMsg = "recive[drawend]";
		scoreDrow();
		myLog(dbMsg);
	});

	socket.on('setmirror', function(data) {
		var dbMsg = "recive[setmirror]";
		isMirror = data.bool;
		dbMsg += ",isMirror="+isMirror;
		document.getElementById('mirrorCB').checked=isMirror;
		myLog(dbMsg);
		mobileLog(dbMsg);
	});

	socket.on('setmirror_h', function(data) {
		var dbMsg = "recive[setmirror_h]";
		is_h_Mirror = data.bool;
		dbMsg += ",左右鏡面="+is_h_Mirror;
		document.getElementById('mirror_h_CB').checked=is_h_Mirror;
		myLog(dbMsg);
		mobileLog(dbMsg);
	});

	socket.on('setautojudge', function(data) {
		var dbMsg = "recive[setautojudge]";
		isAutoJudge = data.bool;
		dbMsg += ",isAutoJudge="+isAutoJudge;
		document.getElementById('autojudgeCB').checked=isAutoJudge;
		if(isAutoJudge){
			useComp.style.display="none";												//判定ボタン
		}else {
			useComp.style.display="inline-block";												//判定ボタン
		}
		myLog(dbMsg);
		mobileLog(dbMsg);
	});

	socket.on('sendcomp', function(data) {
		var dbMsg = "recive[sendcomp]";
		isComp =true;
		dbMsg += ",compColor="+ data.color+" , "+ data.width+" , "+ data.lineCap;
		current.color =data.color;
		colorPalet.value=current.color;
		currentWidth= data.width;
		lineWidthSelect.value=currentWidth;
		currentLineCap =  data.lineCap;
		lineCapSelect.value=currentLineCap;
		myLog(dbMsg);
		mobileLog(dbMsg);
	});

	socket.on('changeColor', function(data) {
		var dbMsg = "recive:chngeColor="+data;
		current.color = data.color;			 // current.color = e.target.className.split(' ')[1];
		colorPalet.value=current.color;
		myLog(dbMsg);
	});

	socket.on('changeLineWidth', function(data) {
		var dbMsg = "recive:changeLineWidth;";
		currentWidth = data.width;
		dbMsg += "="+currentWidth;
		lineWidthSelect.value=currentWidth;
		myLog(dbMsg);
	});

	socket.on('changeLineCap', function(data) {
		var dbMsg = "recive:changeLineCap;";
		currentLineCap = data.lineCap;
		dbMsg += "="+currentLineCap;
		lineCapSelect.value=currentLineCap;
		myLog(dbMsg);
	});

	socket.on('allclear', function(data) {
		var dbMsg = "recive:all clear";
		myLog(dbMsg);
		allClear();
	});

//イベント反映
	function onMouseDown(e) {
		var dbMsg = "[onMouseDown]drawing=" + drawing;
		drawing = true;
		jobSelect.options[4].disabled = false;										//もう一度
		typeSelect.options[6].disabled = false;										//確定
		canvasRect = document.getElementById('hitarea').getBoundingClientRect();
		canvasX =canvasRect.left + window.pageXOffset;
		canvasY = canvasRect.top+ window.pageYOffset;			//canvasRect.top = 110
		dbMsg += ",canvas(" + canvasX + " , " + canvasY + ")";
		canvasWidth = canvasRect.width;
		canvasHeight = canvasRect.height;
		dbMsg += "["+ canvasWidth + " × " + canvasHeight + "]";
		current.x = e.clientX - canvasX;
		current.y = e.clientY - canvasY;
		dbMsg += ",Mouse(" + current.x + " , " + current.y + ")";
		dbMsg += ",is_h_Mirror="+is_h_Mirror;
		if(is_h_Mirror){
			current.x = canvasWidth-current.x;
			dbMsg += ">x>" + current.x;
		}
		dbMsg += ",isMirror="+isMirror;
		if(isMirror){
			current.y = canvasHeight-current.y;
			dbMsg += ">y>" + current.y ;
		}
		drawLine( current.x,  current.y, current.x, current.y, current.color , currentWidth , currentLineCap , 0 , true);
          //htmlの場合は不要、Androidネイティブは書き出しでパスを生成するので必要    //一点しかないので始点終点とも同じ座標を渡すし
		myLog(dbMsg);
	}

	function onMouseMove(e) {
		var dbMsg = "[onMouseMove]drawing=" + drawing;
		if (drawing) {
			dbMsg += ",color=" + current.color+ ",width=" + canvasWidth + "×" + canvasHeight + "]";
			dbMsg += ",canvas(" + canvasX + " , " + canvasY + ")";
			var eX = e.clientX - canvasX;
			var eY = e.clientY- canvasY;
			dbMsg += ",Mouse(" + eX + " , " + eY + ")";
			dbMsg += ",is_h_Mirror="+is_h_Mirror;
			if(is_h_Mirror){
				eX = canvasWidth-eX;
				dbMsg += ">x>" + eX;
			}
			dbMsg += ",isMirror="+isMirror;
			if(isMirror){
				eY = canvasHeight-eY;
				dbMsg += ">y>" + eY;
			}
			drawLine(current.x, current.y,eX, eY, current.color,currentWidth , currentLineCap ,1, true);
			current.x = eX;
			current.y = eY;
			dbMsg += ">>(" + current.x + " , " + current.y + ")";
		}
		myLog(dbMsg);
	}

	function onMouseUp(e) {
		var dbMsg = "[onMouseUp]drawing=" + drawing;
		if (drawing) {
			drawing = false;
			var currentX = current.x;
			var currentY = current.y;
			dbMsg = "(" + currentX + " , " + currentY + ")";
			dbMsg += ",canvas(" + canvasX + " , " + canvasY + ")";
			current.x = e.clientX - canvasX;
			current.y = e.clientY- canvasY;
			dbMsg += ",Mouse(" + current.x + " , " + current.y + ")";
			dbMsg += ",is_h_Mirror="+is_h_Mirror;
			if(is_h_Mirror){
				current.x = canvasWidth-current.x;
				dbMsg += ">x>" + current.x;
			}
			dbMsg += ",isMirror="+isMirror;
			if(isMirror){
				current.y = canvasHeight-current.y;
				dbMsg += ">y>" + current.y ;
			}
			dbMsg += ",color=" + current.color+ ",width=" + currentWidth;
			drawLine(currentX, currentY, current.x, current.y, current.color , currentWidth , currentLineCap , 2 , true);
			dbMsg += ",isComp=" + isComp + ",isAutoJudge=" + isAutoJudge;
			if(isComp && isAutoJudge){			//比較中
				dbMsg += ",room=" + roomVal;
				socket.emit('drawend', {
					room:"/"+roomVal
				});
			}

		}
		myLog(dbMsg);
		mobileLog(dbMsg);

	}

	canvas.ontouchstart = function(event) { //画面に指が触れた
		var dbMsg = "ontouchstart(" + drawing;
		drawing = true;
		jobSelect.options[4].disabled = false;										//もう一度
		typeSelect.options[6].disabled = false;										//確定

		canvasRect = document.getElementById('hitarea').getBoundingClientRect();
		canvasX =canvasRect.left + window.pageXOffset;
		canvasY = canvasRect.top+ window.pageYOffset;			//canvasRect.top = 110
		dbMsg += ",canvas("+ canvasX + " , " + canvasY + ")";
		canvasWidth = canvasRect.width;
		canvasHeight = canvasRect.height;
		dbMsg += "["+ canvasWidth + " × " + canvasHeight + "]";
		var toucheX = event.touches[0].pageX-canvasX; //タッチしている湯便の本数文、イベントは発生する
		var toucheY = event.touches[0].pageY;
		dbMsg += "(" + toucheX + " , " + toucheY + ")";
		if(is_h_Mirror){
			toucheX = canvasWidth-toucheX;
			dbMsg += ">x>" +toucheX;
		}
		dbMsg += ",isMirror="+isMirror;
		if(isMirror){
			toucheY = canvasHeight-toucheY;
			dbMsg += ">y>" + toucheY ;
		}
		current.x = toucheX;
		current.y = toucheY;
		drawLine( current.x,  current.y, current.x, current.y, current.color , currentWidth , currentLineCap , 0 , true);
		myLog(dbMsg);
	};

	canvas.ontouchmove = function(event) { //画面に指を触れたまま動かした
		var dbMsg = "[ontouchmove]drawing=" + drawing;
		if (drawing) {
			event.preventDefault(); // 画面のスクロールを防止する
			var toucheX = event.touches[0].pageX-canvasX;
			var toucheY = event.touches[0].pageY;
			dbMsg += "(" + toucheX + " , " + toucheY + ")";
			dbMsg += ",is_h_Mirror="+is_h_Mirror;
			if(is_h_Mirror){
				toucheX = canvasWidth-toucheX;
				dbMsg += ">x>" + toucheX;
			}
			dbMsg += ",isMirror="+isMirror;
			if(isMirror){
				toucheY = canvasHeight-toucheY;
				dbMsg += ">y>" + toucheY ;
			}
			dbMsg += ",color=" + current.color+ ",width=" + currentWidth;
			drawLine(current.x, current.y, toucheX, toucheY, current.color, currentWidth , currentLineCap , 2,true);
			current.x = toucheX;
			current.y = toucheY;
		}
		myLog(dbMsg);
	};

	canvas.ontouchend = function(event) { //画面から指を離した
		var dbMsg = "[ontouchend]drawing=" + drawing;
		if (drawing) {
			drawing = false;
			var currentX = current.x;
			var currentY = current.y;
			dbMsg += "(" + currentX + " , " + currentY + ")";
			var toucheX = event.touches[0].pageX-canvasX;
			var toucheY = event.touches[0].pageY;
			dbMsg += "～(" + toucheX + " , " + toucheY+ ")";
			dbMsg += ",is_h_Mirror="+is_h_Mirror;
			if(is_h_Mirror){
				toucheX= canvasWidth-toucheX;
				dbMsg += ">x>" + toucheX;
			}
			dbMsg += ",isMirror="+isMirror;
			if(isMirror){
				toucheY = canvasHeight-toucheY;
				dbMsg += ">y>" + toucheY ;
			}
			current.x = toucheX;
			current.y = toucheY;
			dbMsg += ",color=" + current.color+ ",width=" + currentWidth;
			drawLine(currentX, currentY, current.x, current.y, current.color,currentWidth , currentLineCap ,1, true);
			// scoreDrow();
		}
		dbMsg += ",isComp=" + isComp + ",isAutoJudge=" + isAutoJudge;
		if(isComp && isAutoJudge){			//比較中
			dbMsg += ",room=" + roomVal;
			socket.emit('drawend', {
				room:"/"+roomVal
			});
		}
		myLog(dbMsg);
		// mobileLog(dbMsg);
	};

	function touchHandler(evennt) {
		var dbMsg = "[touchHandler]";
		evennt.preventDefault();
		dbMsg += "type="+evennt.type;
		switch (evennt.type) {
			case "touchstart" :
				break;
			case "touchmove" :
				break;
			case "touchcancel" :
				break;
			case "touchend" :
				// var touches = evennt.changedTouches;
				if (drawing) {
					drawing = false;
					var currentX = current.x;
					var currentY = current.y;
					dbMsg += "(" + currentX + " , " + currentY + ")";
					var toucheX = event.touches[0].pageX;
					var toucheY = event.touches[0].pageY-canvasX;
					dbMsg += "～(" + toucheX + " , " + toucheY + ")";
					current.x = toucheX;
					current.y = toucheY;
					dbMsg += ",color=" + current.color+ ",width=" + currentWidth;
					drawLine(currentX, currentY, current.x, current.y, current.color,currentWidth , currentLineCap ,1, true);
					// scoreDrow();
				}
				dbMsg += ",isComp="+isComp;
				// mobileLog(dbMsg);
				if(isComp){			//比較中
					dbMsg += ",room=" + roomVal;
					socket.emit('drawend', {
						room:"/"+roomVal
					});
				}
				break;
		}
	}

	//drawingで受信したデータを書き込む/////////////////////////////////////イベント反映
	function onDrawingEvent(data) {
		var w = canvas.width;
		var h = canvas.height;
		var dbMsg = "[onDrawingEvent]受信(" + data.x0 + " , " + data.y0 + ")";
		dbMsg += "～(" + data.x1 + " , " + data.y1 + ")";
		if ( data.x0 != data.x1 ) {
			dbMsg += "変位(" + (data.x0 - data.x1);
		}
		if ( data.y0 != data.y1 ) {
			dbMsg += "," + (data.y0 - data.y1) + ")";
		}
		dbMsg += ",color=" + data.color+ ",width=" + data.width+ ",lineCap=" + data.lineCap+ ",action=" + data.action;
		drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color , data.width , data.lineCap , data.action , false);
		// if( data.action==1){
		// 	scoreStart();
		// }
		if(data.action != 2){
			myLog(dbMsg);
		}
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
		var dbMsg = "[drawLine](" + x0 + " , " + y0 + ")～(" + x1 + " , " + y1 + ")"+_color;
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
			dbMsg += ",room=" + roomVal;
			socket.emit('drawing', {						//socket.emit('drawing', {
				room : "/" + roomVal ,
				x0: x0 / w,
				y0: y0 / h,
				x1: x1 / w,
				y1: y1 / h,
				color: context.strokeStyle,
				width: currentWidth,
				lineCap:context.lineCap,
				action:action
			});
		}
		// if( action==1){
		// 	scoreStart();
		// }
		if(action != 2){
			myLog(dbMsg);
		}
	}

	function allClear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var dbMsg = "[allClear]";
		orgCount=0;
		// myLog(dbMsg);
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
*input type="file"からファイルを読み込む
*	https://www.html5rocks.com/ja/tutorials/file/dndfiles/
*/
	function handleFileSelect(evt) {
		var dbMsg = "[handleFileSelect]";
		var file = evt.target.files[0]; // FileList object
		if (file.type.match('image.*')) {      // Only process image files.
			var reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					var dbMsg = "[handleFileSelect・reader.onload]";
					dbMsg +=  escape(theFile.name);
					dbMsg += ",e=" +  e;
					srcName = e.target.result;
					dbMsg += srcName;
					myLog(dbMsg);
					directionVal = 0;
					bitmapRead(srcName);
				};
			})(file);
			reader.readAsDataURL(file);        // Read in the image file as a data URL.
		}else{
			alert("画像ファイルを選択して下さい。");
		}
		myLog(dbMsg);
	}

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
		 var tag = "[modalImgList]";
		 var $getListAItems = document.getElementById( "modalImgList" ).children;
		 for( var $i = 0; $i < $getListAItems.length; $i++ ){
			 $getListAItems[$i].onclick =function(){
			 srcName =this.src;			 // current.color = e.target.className.split(' ')[1];
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
	    var tag = "[bitmapRead]srcName="+srcName;
	    var img = new Image();
	    img.src = srcName;
	    var dbMsg = tag + ",src=" + img.src;
	    img.crossOrigin = "Anonymous"; //XAMPP必要；file;//ではcrossdomeinエラー発生
	    img.onload = function(event) {
	        var dbMsg = tag + "[stereoTypeRead.onload]";
	        var dstWidth = this.width;
	        var dstHeight = this.height;
	        dbMsg = dbMsg + ",読み込んだ画像[" + dstWidth + "×" + dstHeight + "]Aspect=" + (dstWidth / dstHeight);
			var canvasRect = document.getElementById('hitarea').getBoundingClientRect();
			var canvasX =canvasRect.left + window.pageXOffset;
			var canvasY = 0;// + window.pageYOffset;			//canvasRect.top = 110
			dbMsg = dbMsg + ",tbCanvas(" + canvasX + " , " + canvasY + ")[" + canvasRect.width + "×" + canvasRect.height +"]";
	        var tbCanvasWidth = canvas.width;
	        var tbCanvasHeight = canvas.height;
	        dbMsg = dbMsg + "[" + tbCanvasWidth + "×" + tbCanvasHeight + "]";
	        var scaleWidth =  tbCanvasWidth/dstWidth;		//dstWidth / tbCanvasWidth;
	        var scaleHeight = tbCanvasHeight/dstHeight;	//dstHeight / tbCanvasHeight;
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
			originPixcel = new Array();				//
			stereoTypeCheck(canvas)
			jobSelect.value = 'none';					//none		comp
			// scoreStart();
			// document.getElementById('header').style.display = "block";
	    }
		myLog(dbMsg);

	}

	/**
	*①読み込んだ画像をピクセル配列に変換する。
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
		var widthrray = new Array();
		var widthrray2 = new Array();
		var checkCount = 0;
		// $('#modal_box').modal();
		// $('#modalTitol').innerHTML = "読み込んだ画像の確認";
		// $('#modalComent').innerHTML = "描画領域[" +cWidth+"×"+cHeight+ "]" ;
		// context.imageSmoothingEnabled = false;
	    // context.mozImageSmoothingEnabled = false;
	    // context.webkitImageSmoothingEnabled = false;
	    // context.msImageSmoothingEnabled = false;
		// for (var i = 0;i < canvasRGBA.length;i+=4) {
		for (var yPos = 0;yPos < canvas.height;yPos++) {
			var pVar = Math.round(yPos/cHeight*100);
			document.getElementById("progressBs").innerHTML =  String(pVar) + "%";
			// $(".progress-bar").css("width", String(pVar) + "%");		// $('.progressBs').css("width", String(pVar) + "%")では反映されない
			document.getElementById("progressBs").style.width =  String(pVar) + "%";
			for (var xPos = 0;xPos < canvas.width;xPos++) {
				var carentPos =	(yPos*(canvas.width*4)) + (xPos*4);
				// var carentPos =(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4);
				var cRed = canvasRGBA[carentPos];					//canvasRGBA[carentPos];
				var cGreen = canvasRGBA[carentPos + 1];					//canvasRGBA[1 + carentPos];
				var cBule = canvasRGBA[carentPos + 2];					//canvasRGBA[2 + carentPos];
				var cAlpha =  canvasRGBA[carentPos + 3]/255;					//canvasRGBA[3 + carentPos];
				var cColor = rgb2hex("rgb("+ cRed + ", " + cGreen + ", " + cBule +")");
				if(cColor!='#000000' && cColor!='#ffffff' ){	//真っ白はもしくは真っ黒もしk儒はデータ無し							&& cAlpha == 1
					// dbMsg += "("+ xPos + ","+ yPos + ")carentPos=" + carentPos +";" + cColor;
					if(bColor == cColor){
						lineWidth++;
						if(0<lineWidth){
							checkCount++;
							if(colorArray2.indexOf(cColor) == -1){							//カラーコードだけの単純配列に無ければ
								colorArray2.push(cColor);
								oRed = cRed;
								oGreen = cGreen;
								oBule = cBule;
								colorArray[colorArray.length]={ name:cColor, value:1 };		//カウント付きの連想配列にも要素追加
								lineWidth=0;
							}else{
								var rIndex = colorArray.filter(function(item, index){
								  if (item.name == cColor){
									var rObj = colorArray[index];
									var rValue = rObj['value']+1;
									colorArray[index]={ name:cColor, value:rValue };
									return index;
								  }
								});
							}
						}
					}else{
						bColor = cColor;
						if(widthrray2.indexOf(lineWidth) == -1){							//カラーコードだけの単純配列に無ければ
							widthrray2.push(lineWidth);
							widthrray[widthrray.length]={ name:lineWidth, value:1 };		//カウント付きの連想配列にも要素追加
						}else{
							var rIndex = widthrray.filter(function(item, index){
							  if (item.name == lineWidth){
								var rObj = widthrray[index];
								var rValue = rObj['value']+1;
								widthrray[index]={ name:lineWidth, value:rValue };
								return index;
							  }
							});
						}
						lineWidth=0;
					}
				}else{
					lineWidth=0;
				}
			}			//xPos
		}				//yPos
		$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている
		dbMsg += ">checkCount>"+checkCount;
		dbMsg += ">抽出色2>"+colorArray2.length +"色；";	// + colorArray.toString();
		dbMsg += ">抽出色>"+colorArray.length +"色；";	// + colorArray.toString();
		if(0<colorArray.length){
			colorArray.sort( function(a, b) {
				 return a.value > b.value ? -1 : 1;
			 });
			orgColor = colorArray[0].name;			//rgb2hex("rgb("+ oRed + ", " + oGreen + ", " + oGreen +")");
			dbMsg += ">current.color>"+ orgColor;
			colorPalet.value=orgColor;
			current.color=orgColor;
			orgCount = colorArray[0].value;										//対象色の点数
			dbMsg += ">評価点>"+orgCount;
		}
		document.getElementById('compTF').innerHTML = orgCount+"";
		document.getElementById('orgTF').innerHTML = orgCount+"";
		if(0<widthrray.length){
			widthrray.sort( function(a, b) {
				 return a.value > b.value ? -1 : 1;
			 });
			lineWidth = widthrray[1].name;			//0pxが最多になる
			dbMsg += ">最多lineWidth>"+ lineWidth;
			if(lineWidth<5){
				lineWidth =5;
			}else if(lineWidth<15){
					lineWidth =10;
			}else if(lineWidth<25){
					lineWidth =20;
			}else if(25<lineWidth){
					lineWidth =30;
			}
			currentWidth=lineWidth;
			dbMsg += ">>"+ currentWidth;
			lineWidthSelect.value=currentWidth;
			dbMsg += "；Y軸上"+widthrray[0].value+"個所";
			dbMsg += ",room=" + roomVal;
			socket.emit('changeLineWidth', {
				room : "/" + roomVal ,
				width:currentWidth
			});
		}
		scoreStartRady();
		myLog(dbMsg);
		if(isDebug){
			document.getElementById('scoreComent').innerHTML = colorArray.length +"色中 対象 "+orgColor + " ;線＝" + lineWidth +"PX";
			var rgba = 'rgba(' + oRed + ',' +oGreen +',' + oBule + ',' + (255 / 255) + ')';
			document.getElementById('scoreComent').style.background =  rgba;		//r=63,g=72,b=204 ="#3fcc48が正解
			// 	editerAria.style.display="inline-block";
		}
		scoreBrock.style.display="inline-block";			//BD
		if(isAutoJudge){
			useComp.style.display="none";												//判定ボタン
		}else {
			useComp.style.display="inline-block";												//判定ボタン
		}
	}

	function drowAgain() {				//やり直し
		var dbMsg = "[drowAgain]srcName="+srcName;
		if(srcName !=""){
			drawing = false;
			isComp=false;				//比較中
			// var img = new Image();
			// img.src = srcName;
			bitmapRead(srcName);
		}else if(0 < originPixcel.length){
			 scoreStartRady();
	 		orgCount=0;
	 		$('#modalTitol').innerHTML = "元データを書き直しています";
	 		// orgCount =setTimeout(scoreCount,1000);
	 		dbMsg += ",orgColo="+ orgColor;
	 		orgCount= reDrowScoreCount(canvas  , originPixcel , orgColor);
	 		dbMsg += ",orgCount="+ orgCount;
	 		compCount = orgCount;
	 		document.getElementById('compTF').innerHTML = orgCount+"";
	 		document.getElementById('orgTF').innerHTML = orgCount+"";

		}else{
			alert("「もう一度」は選択したパターンでやり直す機能です。\n使用するパターンを選択して下さい。");
		}
	}

	function scoreStartRady() {
		var dbMsg = "[scoreStartRady]";
		isComp=true;				//比較中
		originPixcel = new Array();				//
		editerAria.style.display="none";
		scoreBrock.style.display="inline-block";
		if(isAutoJudge){
			useComp.style.display="none";												//判定ボタン
		}else {
			useComp.style.display="inline-block";												//判定ボタン
		}
		document.getElementById('scoreTF').innerHTML = 0+"";
		// orgColor = current.color;
		orgColor = orgColor.toLowerCase();
		dbMsg += ",selectColor="+ orgColor;
		oRed =parseInt(orgColor.slice(1, 3),16);			//16新数；FFを10進数；255に
		oGreen =parseInt(orgColor.slice(3,5),16);
		oBule =parseInt(orgColor.slice(5,7),16);
		dbMsg += ",r="+ oRed+",g="+ oGreen+",b="+ oBule;
		var retRGB =complementary_color(oRed, oGreen, oBule);			 // current.color = e.target.className.split(' ')[1];
		dbMsg += ">retRGB>"+ retRGB;		//rgb(255, 0, 255)
		compColor =rgb2hex(retRGB);
		current.color=compColor;
		dbMsg += ">>"+ current.color+ "," +currentWidth+ "," +currentLineCap;
		// dbMsg +=",emit=" + emit;
		// if (emit) {
		dbMsg += ",room=" + roomVal;
			socket.emit('sendcomp', {
				room : "/" + roomVal ,
				color: compColor,
				width: currentWidth,
				lineCap:currentLineCap
			});
		// }

		myLog(dbMsg);
	}
/**
* Illustrator の計算方法		https://q-az.net/complementary-color-javascript/
*/
	function complementary_color(R, G, B) {
		var dbMsg = "[complementary_color]R=" + R + ",G=" + G + ",B=" + B;
		var comColor =null;
	    //各値全てが数値かつ0以上255以下
		if(isNaN(R + G + B) ) {
		}else if(R ==255 &&  G ==0 &&  B ==0) {
			comColor = "rgb("+ 0 + ", " + 0 + ", " + 255 +")";
		}else if(R ==0 &&  G ==255 &&  B ==0) {
			comColor = "rgb("+ 255 + ", " + 130+ ", " + 0 +")";
		}else if(R ==0 &&  G ==0 &&  B ==255) {
			comColor = "rgb("+ 255 + ", " + 0 + ", " + 0 +")";
    	}else if(0 <= R && R <=255 && 0 <= G && G <=255 && 0 <= B && B <=255) {
			//最大値、最小値を得る
	        var max = Math.max(R, Math.max(G, B));
	        var min = Math.min(R, Math.min(G, B));
	        var sum = max + min;	        //最大値と最小値を足す
	        //R、G、B 値を和から引く
	        var newR = sum - R;
	        var newG = sum - G;
	        var newB = sum - B;
	         comColor = "rgb("+ newR + ", " + newG + ", " + newB +")";
	        //文字列を返す
	    } else {
	        //if 条件から外れた場合は null を返す
	    }
		dbMsg = ",comColor=" + comColor;
		myLog(dbMsg);
		return comColor;
	}

	function rgb2hex ( col ) {
		// var dbMsg = "[rgb2hex]col=" + col;
		// var retStr;
		// // // retStr = retStr.toLowerCase();
		// // dbMsg += ">>"+ retStr;
		// myLog(dbMsg);
		return "#" + col.match(/\d+/g).map(function(a){return ("0" + parseInt(a).toString(16)).slice(-2).toLowerCase()}).join("");
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
		$('#modalTitol').innerHTML = "どれだけトレースできたかを確認しています";
		compCount =scoreCount(canvas , orgColor);
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


	function scoreStart() {
		var dbMsg = "[scoreStart]";
		scoreStartRady();
		orgCount=0;
		$('#modalTitol').innerHTML = "元データを確認しています";
		// orgCount =setTimeout(scoreCount,1000);
		dbMsg += ",orgColo="+ orgColor;
		orgCount =scoreCount(canvas ,  orgColor);
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
		if(isDebug){
			editerAria.style.display="inline-block";
		}

	}

	function scoreCount(canvas  , orgColor) {
		var dbMsg = "[scoreCount]orgColor="+ orgColor;
		var dCount =0;
		var checkCount = 0;														//色がついている部分
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		dbMsg += "["+ cWidth + "×"+ cHeight + "]";
		var context = canvas.getContext('2d');
		var canvasImageData = context.getImageData(0, 0, cWidth, cHeight);
		var canvasRGBA = canvasImageData.data;
		if(originPixcel){
			if(0==originPixcel.length){
				 originPixcel = canvasImageData.data;
			}
		}
		// $('body').addClass('modal-open');
		// $("#progressFleam").css("display", "block");
		$('#modal_box').modal();
		document.getElementById("modalImgList").style.display="none";
		document.getElementById("progressBase").style.display="block";
		$('#modalComent').innerHTML = "描画領域[" +cWidth+"×"+cHeight+ "]" ;
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
		for (var yPos = 0;yPos < cHeight;yPos++) {
			var pVar = Math.round(yPos/cHeight*100);
			document.getElementById("progressBs").innerHTML =  String(pVar) + "%";
			// $(".progress-bar").css("width", String(pVar) + "%");		// $('.progressBs').css("width", String(pVar) + "%")では反映されない
			document.getElementById("progressBs").style.width =  String(pVar) + "%";
			for (var xPos = 0;xPos < cWidth;xPos++) {
				var carentPos =	(yPos*(cWidth*4)) + (xPos*4);
				// var carentPos =(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4);
				var cRed = canvasRGBA[carentPos];					//canvasRGBA[carentPos];
				var cGreen = canvasRGBA[carentPos + 1];					//canvasRGBA[1 + carentPos];
				var cBule = canvasRGBA[carentPos + 2];					//canvasRGBA[2 + carentPos];
				var cAlpha =  canvasRGBA[carentPos + 3]/255;					//canvasRGBA[3 + carentPos];
				var cColor = rgb2hex("rgb("+ cRed + ", " + cGreen + ", " + cBule +")");

				if(cColor!='#000000' && cColor!='#ffffff' ){	//真っ白はもしくは真っ黒もしk儒はデータ無し							&& cAlpha == 1
					checkCount++;
					if(orgColor == cColor){
						dbMsg += "("+ xPos + ","+ yPos + ")"+cColor;
						dbMsg += ",r="+ cRed+",g="+ cGreen+",b="+ cBule+",a="+ cAlpha;
						dCount++;
					}
				}
			}
		}
		// $('body').removeClass('modal-open'); // 1； body に自動的に付与されるクラスを削除する。このクラスがついたままだと、 画面スクロールが効かなくなる
		// $('.modal-backdrop').remove();       // 2；モーダルの背景（黒い部分）を削除する処理。この処理を行わないとモーダルは消えても、背景が残ったままになり、 クリックが効かないままになる
		$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている
		// document.getElementById("progressBs").style.display="none";
		// removeLoading();
//			document.getElementById("progressFleam").style.display="none";			 // ここでstyleは無効
		dbMsg += ">>>dCount=" + dCount +"/" + checkCount;
		myLog(dbMsg);
		return dCount;
		// return onSuccess(dCount);
    // });
	}

	function reDrowScoreCount(canvas  , originPixcel , orgColor) {
		var dbMsg = "[reDrowScoreCount]orgColor="+ orgColor + "originPixcel" + originPixcel.length;
		var dCount =0;
		var checkCount = 0;														//色がついている部分
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		dbMsg += "["+ cWidth + "×"+ cHeight + "]";
		var context = canvas.getContext('2d');
		var canvasImageData = context.getImageData(0, 0, cWidth, cHeight);
		var canvasRGBA = originPixcel;
		var newImageData = context.createImageData(canvas.width, canvas.height);
		var newRGBA = newImageData.data;
		$('#modal_box').modal();
		document.getElementById("modalImgList").style.display="none";
		document.getElementById("progressBase").style.display="block";
		$('#modalComent').innerHTML = "描画領域[" +cWidth+"×"+cHeight+ "]" ;
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
		for (var yPos = 0;yPos < cHeight;yPos++) {
			var pVar = Math.round(yPos/cHeight*100);
			document.getElementById("progressBs").innerHTML =  String(pVar) + "%";
			// $(".progress-bar").css("width", String(pVar) + "%");		// $('.progressBs').css("width", String(pVar) + "%")では反映されない
			document.getElementById("progressBs").style.width =  String(pVar) + "%";
			for (var xPos = 0;xPos < cWidth;xPos++) {
				var carentPos =	(yPos*(cWidth*4)) + (xPos*4);
				// var carentPos =(xPos * 4) + ((canvas.height - 1 - yPos) * canvas.width * 4);
				var cRed = canvasRGBA[carentPos];					//canvasRGBA[carentPos];
				var cGreen = canvasRGBA[carentPos + 1];					//canvasRGBA[1 + carentPos];
				var cBule = canvasRGBA[carentPos + 2];					//canvasRGBA[2 + carentPos];
				var cAlpha =  canvasRGBA[carentPos + 3]/255;					//canvasRGBA[3 + carentPos];
				var cColor = rgb2hex("rgb("+ cRed + ", " + cGreen + ", " + cBule +")");

				newRGBA[carentPos] = canvasRGBA[carentPos];
				newRGBA[1 + carentPos] = canvasRGBA[1 + carentPos];
				newRGBA[2 + carentPos] = canvasRGBA[2 + carentPos];
				newRGBA[3 + carentPos] = canvasRGBA[3 + carentPos];

				if(cColor!='#000000' && cColor!='#ffffff' ){	//真っ白はもしくは真っ黒もしk儒はデータ無し							&& cAlpha == 1
					checkCount++;
					if(orgColor == cColor){
						dbMsg += "("+ xPos + ","+ yPos + ")"+cColor;
						dbMsg += ",r="+ cRed+",g="+ cGreen+",b="+ cBule+",a="+ cAlpha;
						dCount++;
					}
				}
			}
		}
		context.putImageData(newImageData, 0, 0);					// コピーしたピクセル情報をCanvasに転送

		// $('body').removeClass('modal-open'); // 1； body に自動的に付与されるクラスを削除する。このクラスがついたままだと、 画面スクロールが効かなくなる
		// $('.modal-backdrop').remove();       // 2；モーダルの背景（黒い部分）を削除する処理。この処理を行わないとモーダルは消えても、背景が残ったままになり、 クリックが効かないままになる
		$('#modal_box').modal('hide');        // 3；モーダル自体を閉じている
		// document.getElementById("progressBs").style.display="none";
		// removeLoading();
//			document.getElementById("progressFleam").style.display="none";			 // ここでstyleは無効
		dbMsg += ">>>dCount=" + dCount +"/" + checkCount;
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

 }
)();


//Canvas とピクセル操作	https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas
//上下反転	http://www.programmingmat.jp/webhtml_lab/canvas_image.html
