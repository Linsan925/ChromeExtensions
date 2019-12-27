//===猎聘===
//兼容不支持根据className获取节点
if (!document.getElementsByClassName) {

    document.getElementsByClassName = function(className, element) {
        var children = (element || document).getElementsByTagName('*');
        var elements = new Array();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    elements.push(child);
                    break;
                }
            }
        }
        return elements;
    };
}

var jqResume = $("div[class=resume]");
if (jqResume) {
    var rawcode = document.getElementsByClassName("resume-sub-info")[0];
    var code = rawcode.getElementsByTagName("span")[0].innerHTML;
}

var json = {
    type: "2",
    code: code
};
var ohasone = document.getElementsByClassName("text-error");
var hasone = false;
if (ohasone.length == 2) {
    hasone = false;
} else {
    hasone = true;
    var oPhonenum = document.getElementsByClassName("telphone")[0];
    var oEmail = document.getElementsByClassName("email")[0];

    if (oPhonenum) {
        convertImgToBase64(oPhonenum.src, function(base64Img) {
            oPhonenum.src = base64Img;
        });
    } else {}
    if (oEmail) {
        convertImgToBase64(oEmail.src, function(base64Img) {
            oEmail.src = base64Img;
        });
    } else {}
}

//针对猎聘，规定有任何联系方式，就为ture，否则为false
showRnss(jqResume, "2", json, function() {
    var $exp = $('#workexp_anchor', jqResume);
    var iExpReadyCheck = setInterval(check, 500);
    var iExpReadyCheckLoopCount = 0;
    var tVersion = '4.0.8';//当前版本号
    //猎聘的特殊处理
    function check() {
        iExpReadyCheckLoopCount = iExpReadyCheckLoopCount + 1;
        //console.log("explength" + $exp.html().length);
        if (iExpReadyCheckLoopCount > 15) {
            clearInterval(iExpReadyCheck);
            updateNoResultBody();
            return;
        } else if ($exp.html().length < 50) {
            return;
        } else {
            clearInterval(iExpReadyCheck);
        }

        var base = new Base64();

        //console.log(jqResume.html())
        sendMsg("http://staff.risfond.com/extension/queryresumes", "POST", "type=" + 2 + "&hasone=" + hasone + "&version=" + tVersion + "&htmlresume=" + base.encode(jqResume.html().replace("+", "%2B")), function(response) {
            console.log(response);
            var objResponse = eval("(" + response + ")");
            updateContact(objResponse, json);
        });
    }
})

//===将猎聘代码转换为base64格式
function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    };
    img.src = url;
}