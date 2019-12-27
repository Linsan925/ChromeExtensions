$("a[class*=mark]").each(function(){
    var $a = $(this);
    var title = $a.prop('title');
    var newHref = $a.prop('href') + '&name=' + encodeURIComponent(title);
    $a.prop('href', newHref);
});