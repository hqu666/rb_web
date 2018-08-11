var dbMsg = "[util.js]";
var isDebug =true;
var isSmaphoDebug =true;
var isMobile=false;				//現在使用しているのはスマホ

var protocol ; //protocol=http:
var urlStr ; //protocol + hostname + port + hash をまとめて取得
var host ; //host=127.0.0.1
var path ; //path=/　,query=
var port ; //path=/　,query=
var search ;
var query ;
var hash;
var ua;

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

	function getSituation() { // onload	;	ページ読み込み時に実行したい処理
		var dbMsg = "[util.getSituation]";
		 protocol = location.protocol
		dbMsg += "　,protocol=" + protocol; //protocol=http:
		urlStr = location.href + "";
		dbMsg += ",urlStr=　" + urlStr; //protocol + hostname + port + hash をまとめて取得
		 host = location.hostname; //プロトコル情報を除外したURLを取得する(port情報なし)>>
		dbMsg += "　,host=" + host; //host=127.0.0.1
		 path = location.pathname; //URLでパスの部分を取得・設定する
		dbMsg += "　,path=" + path; //path=/　,query=
		 port = location.port; //":3080/" ;
		dbMsg += "　,port=" + port; //path=/　,query=
		 search = location.search;
		dbMsg += "　,search=" + search;
		 query = location.query;
		dbMsg += "　,query=" + query;
		 hash = location.hash; //location.hash	URL内のハッシュ情報を抽出して取得する
		dbMsg += "　,hash=" + hash;
		ua = navigator.userAgent;
		dbMsg += ",ua=" + ua;
		if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('iPod') > -1 || ua.indexOf('Android') > -1 || ua.indexOf('Mobile') > -1) {
			isMobile = true; //現在使用しているのはスマホ
		}
		if (-1 < urlStr.indexOf('127.0.0.1')) { //xamppでのテスト中は
			if(isMobile){
				// applican.wifi.getCurrentIPv4Address(getCurrentIPv4Address_Success, getCurrentIPv4Address_Error);
				var wifiURL ;			//='<?php echo $_SERVER['REMOTE_ADDR']; ?>';
				// var wifiURL = '192.168.100.6'; //課題；取得方法；Javascriptでは取得できない
				wifiURL = '192.168.3.14'; //自宅
				dbMsg += "　,wifiURL=" + wifiURL;
				urlStr = urlStr.replace('127.0.0.1', wifiURL); //'http://192.168.3.10:3080'
			}
		} else {
			isDebug = false;
			isSmaphoDebug = false;
		}
		myLog(dbMsg);
	}

	/**
	 *2桁にして返す
	 */
	function towFigures(iVal) {
		var dbMsg = "[util.towFigures]"
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
		var dbMsg = "[util.retNowStr]";
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
