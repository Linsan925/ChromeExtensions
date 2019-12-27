//页面间通信，向background传递message
function sendMsg(url, method, data, callback) {
	var message = {
		url: url,
		method: method,
		data: data,
	};

	chrome.runtime.sendMessage(message, function(response) {
		callback(response);
	});
}

//参数：特征节点，简历类型，一键录入功能所需{type:"简历类型",code:"简历ID"}，猎聘网单独处理方法
function showRnss(marker, typenum, json, fn) {
	var isResumePage = marker.length == 1;
	var resumePageStatusBar = "没有简历";

	var base = new Base64();
  	var tVersion = '4.0.8';//当前版本号
	//寄生页面插入助手
	var jqbody = $("body");
	var jqContainer = $("#rnsshelperContainer");

	if(typeof(jqContainer) == "undefined" || jqContainer.length == 0) {
		jqContainer = $('<div id="rnsshelperContainer"><div class="rnssHelper-logo" id="rnsshelperLogo" title="锐仕方达简历助手 v' + tVersion + '">锐仕方达简历助手 v' + tVersion + '</div><div class="rnssHelper-body" id="rnsshelperBody"></div></div>');
	}

	if(isResumePage) {
		jqbody.css("padding-top", "30px");
		jqbody.append(jqContainer);
		resumePageStatusBar = "<span>正在努力搜索人选的联系方式，请稍候……</span>";
		updateBody(resumePageStatusBar);

		//猎聘网处理入口
		if(fn) {
			fn();
		} else {
			//下面的version=数是传给后台的，必须一致才能正常使用
			sendMsg("http://staff.risfond.com/extension/queryresumes", "POST", "type=" + typenum + "&hasone=" + false + "&version=" + tVersion + "&htmlresume=" + base.encode(jqResume.html().replace("+", "%2B")),
				function(response) {
					//console.log(response);
					if(!response) {
						response = '{"Status":2,"Data":"用户还没有登录，请先在RNSS系统中登录。"}';
					}
					var objResponse = eval("(" + response + ")");
					updateContact(objResponse, json);
				});

		}
	} else {
		updateBody(resumePageStatusBar);
	}
	caculateWidth();
}

//===background.js返回数据处理===
function updateContact(response, json) {

	//=1正常工作模式
	if(response.Status == 1) {

		if(response.Data.Status == 4) {

			updateBody("<span style='color:red;'>该网站即将支持简历助手，敬请期待</span>");

		} else if(response.Data.Status == 5) {

			var base = new Base64();
			var resumeJsonStr = "type=4&html=" + encodeURIComponent(jqResume.html());
			var resumeJsonStr2 = "type=4&html=" + base.encode(jqResume.html().replace("+", "%2B"));

			//=5时弹出申请下载选项
			if(response.Data.WriteStatus == 1 && response.Data.Count == 0) {
				updateBody("<span>搜索结束，很遗憾，没能挖出任何联系方式……</span><span id='app_download' info='" + resumeJsonStr + "' class='appdownload-btn' title='提交到RNSS系统中付费下载，会产生费用，请谨慎操作'>申请付费下载</span>");
				applyForDownload(resumeJsonStr2); //简历下载
			}

			if(response.Data.WriteStatus == 1 && response.Data.Count > 0) {
				updateHasResultBody(response);
				ViewResume(response);
				$("#rnsshelperBody").append("<span id='app_download' class='appdownload-btn' info='" + resumeJsonStr + "' title='提交到RNSS系统中付费下载，会产生费用，请谨慎操作'>申请付费下载</span>")
				applyForDownload(resumeJsonStr2); //简历下载
			}

		} else {

			//是否该提示贡献值+1的提示
			if(response.Data.WriteStatus == 2) {
				updateBody("<span style='color:green;'>恭喜您成功录入一份新简历，贡献简历<span class='thanksTips'>+1</span></span>");
				ViewResume(response);
			} else {
				//不管是否在系统中查询到该简历，都可以一键录入并查看
				if(response.Data.Count == 0) {
					updateNoResultBody();
					onekeydone(json);
				}

				if(response.Data.Count > 0) {
					updateHasResultBody(response);
					ViewResume(response);
					onekeydone(json);
				}

			}
		}
	}

	if(response.Status == 2) {
		updateBody('<a href="http://staff.risfond.com/" target="_blank" class="colors" title="点击去登录RNSS">请先到RNSS系统中登录</a>，登录成功后，可以刷新本页面。<a href="javascript:location=location" class="colors">点此刷新</a>');
	}

	if(response.Status == 3) {
		var Version = eval("(" + response.Data + ")");
		var dloadUrl = Version.url; //需要传http标准模式下的路径地址
		var newversion = Version.version;
		var jqHtml4 = $("<a href=" + dloadUrl + " target=_blank class='dloadUrl'>点击下载</a>");
		updateBody('<span style="color:red" class="updateMsg">当前简历助手版本需要升级，最新版本V' + newversion + '</span>');
		appendBody(jqHtml4);
	}

	if(response.Status == 4) {
		updateBody('<span style="color:red;">简历助手可能无法解析该简历，再换一份吧</span>')
	}

}

//页面更新函数
function updateBody(html) {
	$("#rnsshelperBody").html(html);
}
//未查询到结果下页面更新函数
function updateNoResultBody() {
	updateBody('<span style="color:red;">搜索结束，很遗憾，没能挖出任何联系方式……该买就买吧！记得要录入系统哦！</span>');
}
//查询到结果下进行页面更新函数
function updateHasResultBody(response) {

	var html ="";
	if(response.Data.Message===""){
		html = '<span style="color:green;" class="fl" id="titlespan">匹配度：$MatchScore$%，姓名：$name$，手机：$mobile$，邮箱：$email$，共有$resumecount$份相关简历</span>';
		html = html.replace('$name$', response.Data.Name);
		html = html.replace('$mobile$', "[" + response.Data.MobileNumber.join(",") + "]");
		html = html.replace('$email$', "[" + response.Data.EmailAddress.join(",") + "]");
		html = html.replace('$resumecount$', response.Data.Count);
		html = html.replace('$MatchScore$', (response.Data.ResumesMatchInfo[0].MatchScore).toString().substring(0, 5));
	}
	else{
		html = '<span style="color:green;" class="fl" id="titlespan">姓名：$name$，手机：$mobile$，邮箱：$email$</span><span style="color:red;" >但是$Message$是否查看</span>';
		html = html.replace('$name$', response.Data.Name);
		html = html.replace('$mobile$', "[" + response.Data.MobileNumber.join(",") + "]");
		html = html.replace('$email$', "[" + response.Data.EmailAddress.join(",") + "]");
		html = html.replace('$Message$', response.Data.Message); 
	} 

	
	updateBody(html);
	var oSpan = document.getElementById("titlespan");
	oSpan.title = oSpan.innerHTML;
}

//节点添加函数
function appendBody(obj) {
	$("#rnsshelperBody").append(obj);
}

//转入系统查看接口，依赖后台返回的参数
function ViewResume(response) {
	var VRHTML1 = $('<a class="rnssHelper-button fl" href="http://staff.risfond.com/resume/viewresume?id='+response.Data.ResumeIdList[0]+'" target="_blank">进入系统查看</a>');
	//var VRHTML1 = $('<a class="rnssHelper-button fl" href="javascript:void(0)">进入系统查看</a>');
	// var VRHTML2 = $('<form id="rnssHelper-queryMore" target="_blank" method="GET" action="http://staff.risfond.com/resume/search"><input type="hidden" name="resumeid"/><form>');
	// $("input[name=resumeid]", VRHTML2).val(response.Data.ResumeIdList.join(","));
	appendBody(VRHTML1);
	// appendBody(VRHTML2);
	// VRHTML1.on('click', function() {
	// 	VRHTML2.submit();
	// });
}

//一键录入接口
function onekeydone(json) {
	var base = new Base64();

	var markDownHTML = $('<form action="http://staff.risfond.com/apps/editresume.aspx" method="post" id="r_resumeform" target="_blank"><input type="text" name="type" value="" style="display:none;" /><textarea name="txt" style="display:none;"></textarea><input type="text" name="code" value="" style="display:none;" /> <a class="rnssHelper-button"  id="rnssHelper-fillin" href="javascript:;">一键录入</a></form>');
	appendBody(markDownHTML);
	var type = json.type;
	var code = json.code;
	var txt = document.getElementsByTagName("html")[0].outerHTML;
	$("#rnssHelper-fillin").on("click", function() {
		var panel = $("#r_resumeform"),
			s_type = panel.find("[name=type]"),
			s_txt = panel.find("[name=txt]"),
			s_code = panel.find("[name=code]");
		s_type.val(base.encode(type.replace("+", "%2B")));
		s_txt.val(base.encode(txt.replace("+", "%2B")));
		s_code.val(base.encode(code.replace("+", "%2B")));
		panel.submit();
	});
}

//申请下载-目前只针对智联
function applyForDownload(datas) {

	$("#app_download").bind("click", function() {
		var ele = $("#app_download");
		var info = ele.attr("info");

		sendMsg("http://staff.risfond.com/extension/applyresumedownrequest", "POST", datas,
			function(response) {
				var objResponse = eval("(" + response + ")");
				if(objResponse.Success) {
					ele.unbind("click");
					ele.html("申请成功");
					ele.css({
						"color": "green",
						"border": "none",
						"cursor": "initial"
					});
				} else {
					ele.unbind("click");
					ele.html(objResponse.Message);
					ele.css({
						"color": "red",
						"border": "none",
						"cursor": "initial"
					});
				}
			});
	})
}

//编码
function Base64() {

	// private property  
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// public method for encoding  
	this.encode = function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while(i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if(isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if(isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}

	// public method for decoding  
	this.decode = function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while(i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if(enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if(enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}

	// private method for UTF-8 encoding  
	_utf8_encode = function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for(var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if(c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}
		return utftext;
	}

	// private method for UTF-8 decoding  
	_utf8_decode = function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while(i < utftext.length) {
			c = utftext.charCodeAt(i);
			if(c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

window.onresize = function() {
	caculateWidth();
}

function caculateWidth() {
	var cWidth = document.documentElement.clientWidth || document.body.clientWidth;
	$("#rnsshelperBody").width(cWidth - 192);
}