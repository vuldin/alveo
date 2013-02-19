$(function(){
  if(!navigator.userAgent.match(/(Nintendo WiiU)/)){
    $('#consoleWrapper').css('display','none');
  }
});
function log(text){
  if(navigator.userAgent.match(/(Nintendo WiiU)/)){
    jQuery('<div/>',{
      //id:'consoleDiv',
      text:text
    }).addClass('consoleText').appendTo($('#console'));
    fitConsoleOutput();
  }else{
    console.log(text);
  }
}
function fitConsoleOutput(){
  if($('#console').children().height()*$('#console').children().length>$(window).height()-20){
    $('#console').children().first().empty();
    $('#console').children().first().remove();
    fitConsoleOutput();
  }
}