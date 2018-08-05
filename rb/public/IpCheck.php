<?php
	//javascriptファイルとして処理させる
	header("Content-type: application/x-javascript");
	//IPアドレスを変数に代入
	$ip_address = $_SERVER['REMOTE_ADDR'];
	//スクリプトの出力
	echo "var ipAddress = '" . $ip_address . "';";
?>
