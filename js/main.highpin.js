var jqResume;

setTimeout(function() {
    //====智联卓聘====
    jqResume = $("div[class*=detailbox]");

    //var rawcode = $(".public-set span").get(0).innerHTML;
    //var code = rawcode.substring(5)
    var code = $(".resume-id span span").get(0).innerHTML;

    showRnss(jqResume, "3", {
        type: "3",
        code: code
    });
}, 50)