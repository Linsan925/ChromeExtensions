//====LinkedIn====
function showRnss_Override()
{

	//console.log($("button[data-control-name='contact_see_more']").length);	
	/*if($(".pv-contact-info__ci-container"))
	{
		$(".contact-see-more-less").click();
	}*/
	/*console.log('执行前');
	console.log('可展开'+$("button[data-control-name='contact_see_more']").length+'可收回'+$("button[data-control-name='contact_see_less']").length);*/
	$("button[data-control-name='contact_see_more']").click();
	$("button[data-control-name='contact_see_more']").click();

	/*console.log('执行后');
	console.log('可展开'+$("button[data-control-name='contact_see_more']").length+'可收回'+$("button[data-control-name='contact_see_less']").length);*/


	$(".pv-profile-section__show-more-detail").click();
	//console.log($(".truncate-multiline--button").length);
	$(".truncate-multiline--button").click();
	console.log('执行了linkedin');	
	showRnss($("body"),"7",{type:"7",code:""});		
	//console.log(iCheckCount);
	//iCheckCount++;
	if($("#rnsshelperContainer"))
	{
		$('.nav-main-container').css("top","30px");
	}else{
		$('.nav-main-container').css("top","0");
	}	
	
}
var setScrollTop=function()
{	
	 $('html,body').animate({scrollTop:($('html,body').height()/2)},100,function(){
	 	document.body.scrollTop=100;
		//$('html,body').scrollTop(100);
	});
}
var jqResume = $("body");
var exeCount=0;
if($('.profile-detail')&&$('.right-rail__info_container'))
{
	setScrollTop();	
	setTimeout(showRnss_Override, 1800);
	
}else{
	
	setScrollTop();
	var intCheck=setInterval(check, 1800);
}

function check()
{			
	if(!$('.profile-detail')&&!$('.right-rail__info_container'))return;	
	if(exeCount>2){
		clearAll(intCheck);
		return;
	}
	clearInterval(intCheck);	
	showRnss_Override();	
}

function clearAll(timeId)
{
   while(--timeId>0)
   {
   	  clearInterval(timeId);
   }
}
function showRnss_Time()
{
	console.log('执行了linkedin');	
	showRnss($("body"),"7",{type:"7",code:""});			
	if($("#rnsshelperContainer"))
	{
		$('.nav-main-container').css("top","30px");
	}else{
		$('.nav-main-container').css("top","0");
	}	
}

