//===无忧精英===
console.log('sdfsdsdfsdf');
var jqResume = $("html");
var rawcodeCot=document.getElementsByClassName("icard")[0]
var code = "";
console.log(rawcodeCot);
if (rawcodeCot) {
  var rawcodeArr=rawcodeCot.innerText.split(':');
  if (rawcodeArr.length > 1) {
    code = rawcodeArr[1];
  }
}

showRnss(jqResume,"6",{type:"6",code:code});
