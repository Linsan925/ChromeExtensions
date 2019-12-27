// 兼容17之前版本的chrome，若需要使用chrome.experimental，需要在 about:flags 中“启用“实验用。。API”
var wR = chrome.webRequest || chrome.experimental.webRequest
if (wR) {
  wR.onBeforeSendHeaders.addListener(
    function (details) {
      if (details.type === 'xmlhttprequest') {
        var exists = false
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Referer') {
            exists = true
            details.requestHeaders[i].value =
              'https://h.liepin.com/resume/showresumedetail'
            break
          }
          if (details.requestHeaders[i].name === 'Accept') {
            exists = true
            details.requestHeaders[i].value =
              'image/webp,image/apng,image/*,*/*;q=0.8'
          }
        }
        if (!exists) {
          // 不存在 Referer 就添加
          details.requestHeaders.push({
            name: 'Referer',
            value:
              'https://h.liepin.com/resume/showresumedetail'
          })
        }
        return { requestHeaders: details.requestHeaders }
      }
    },
    {
      urls: [
        'https://h.liepin.com/image/resume/*',
        'http://h.liepin.com/image/resume/*'
      ]
    }, // 匹配访问的目标url
    ['blocking', 'requestHeaders']
  )
}

/*
 * 接受来自content script的消息并处理，例如智联main.zhaopin.js就是判断当前页面有resume-body-left类名的时候判断是该搜索的页面，然后就会发送一个通信请求，传递一个 message = { url:url, method: method, data:data}到这个JS;
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var url = message.url;
    var method = getRequestMethod(message.method); //规定发送方式，仅仅是做了一个转换为大写的优化
    var data = message.data;

    if (data.length <= 10) {
        console.log("呵呵");
        console.log(data);
        return;
    }

    var nowTime = new Date().getTime(); //获取当前时间作为随机数
    var newurl = url + "?time=" + nowTime;

    var xhr = new XMLHttpRequest();
    xhr.open(method, newurl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            sendResponse(xhr.responseText);
        }
    }

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(data);

    // If you want to asynchronously use sendResponse, add return true; to the onMessage event handler.
    return true;
});

//规范请求方式
function getRequestMethod(input) {
    return input != null || input.toUpperCase() == "POST" ? "POST" : "GET";
}

function getImg(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = 'blob';
    xmlhttp.addEventListener('load', function() {
        if (!xmlhttp.response) return;
        postMsg(xmlhttp.response, callback)
    })
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function requestPost(info, callback) {
    try {
        info = JSON.parse(info)
    } catch (e) {}
    if (typeof info == 'string') return;
    var url = info.reqUrl;
    delete info.reqUrl;
    info = JSON.stringify(info)
    info = encodeURIComponent(info);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener('load', function() {
        callback(xmlhttp.responseText)
    })
    xmlhttp.open("POST", url, true);
    xmlhttp.send(info);
}

function request(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener('load', function() {
        callback(xmlhttp.responseText)
    })
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
};
//linkedin监控
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (/http.?:\/\/www.linkedin.com\/.*/.test(tab.url)) {
        if (/http.?:\/\/www.linkedin.com\/in\/.*\//.test(tab.url)) {
            if ("complete" == changeInfo.status) {
                chrome.tabs.executeScript(tab.id, {
                    file: 'libs/jquery.min.js'
                });
                chrome.tabs.executeScript(tab.id, {
                    file: 'js/common.js'
                });
                chrome.tabs.executeScript(tab.id, {
                    file: 'js/main.linkedin.js'
                });
                chrome.tabs.insertCSS(tab.id, {
                    file: 'css/main.css'
                });
            }
        } else {
            chrome.tabs.executeScript({
                code: "if(document.getElementById('rnsshelperContainer'))document.body.removeChild(document.getElementById('rnsshelperContainer'))"
            });
            chrome.tabs.executeScript({
                code: "if(document.getElementById('extended-nav'))document.getElementById('extended-nav').style.top='0'"
            });
        }
    }

});