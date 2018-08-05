/*
 * php側のファイルで「$_SERVER」を返しています。詳しくは下記のサイトで確認してください。
 * http://php.net/manual/ja/reserved.variables.server.php
 */

$(function(){
	//phpファイル
	var URL = "./IpCheck.php"
	//表示場所のID
	var VID = "#ViewArea";
	
	$.ajax({
		url: URL,
		cache: false,
		success: function(data){
			var Jdata = eval( "("+data+")" );
			if(Jdata['REMOTE_ADDR']!=''){
				$(VID).append('<p>あなたのグローバルIPアドレスは「'+Jdata['REMOTE_ADDR']+'」です。</p>');	
			}
		},
		error : function(){
			$(VID).append('<p>データの送信に失敗しました。</p>');				
		}
	});
});

