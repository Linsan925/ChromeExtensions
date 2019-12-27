setTimeout(executePage, 1500);

function executePage() {


    if ($(".resume-content__candidate-basic") && $(".dave-resDetail-Info")) {

        jqResume = $("html");

        var code = "";
        if ($(".resume-content--letter-spacing").length > 0) {
            var regText = new RegExp(/(?=(ID：)).*/);

            var codeTx = $(".resume-content--letter-spacing").text();
            if (regText.test(codeTx)) {
                code = $.trim(codeTx.match(regText)[0].substr(3)) || "nothing";
            }
        }

        jqResume.find("#moreTalents").html("");
        //jqResume.find(".resume-detail__actions").html("");


        showRnss(jqResume, "4", {
            type: "4",
            code: code
        });

    } else {
        setTimeout(executePage, 1500);
    }
}

//execute();
/*function execute()
{
//===智联招聘===
//通过页面的特征节点确定招聘网站
jqResume = $("div[class*=personage-resume-container]");
console.log($(".portraitStatusContainer").length());
if(!$(".portraitStatusContainer"))
{
  setTimeout(execute, 2000);
  console.log("1");
}else
{
   showRnss($("div[class*=personage-resume-container]"),"4",{type:"4",code:1});
   console.log($("div[class*=personage-resume-container]").html());
   console.log(2);
}

//与后台预定的发送消息的 "type=？
//一键录入时需要一个{type:,code:}的JSON字符串，type是代表哪个网站的简历，code是简历编号
//var rawcode=document.getElementsByClassName("r-resume-time span")[1].innerHTML;

//var code=rawcode.substring(9)

//申请下载
}*/