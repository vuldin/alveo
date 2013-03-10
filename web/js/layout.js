/**@license
 * alveo <https://github.com/joshuapurcell/alveo>
 * Copyright (C) 2013 Joshua Purcell <joshua.purcell@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
$(function(){
  resizePage();
});
$(window).on('resize',resizePage);
function resizePage(){
  //$('body').height($(window).height());
  log('resizePage: window height: '+$(window).height());
  if(navigator.userAgent.match(/(Nintendo WiiU)/)){
    // TODO remove once video is in detail overlay
    $('#video').css('display','none');
    var vpString=$('meta[name=viewport]').attr('content');
    var vpHeight=-1;
    if($(window).height()>400){
      // initial WiiU resize 
      vpHeight=400;
    }
    if($(window).height()==400){
      // WiiU resize when getting ready for vid playback 
      vpHeight=350;
    }
    log('viewport height: '+vpHeight);
    if(vpString.indexOf('height')==-1)vpString+=',height='+vpHeight;
    else vpString=vpString.substring(0,vpString.indexOf('height')+7)+vpHeight;
    $('meta[name=viewport]').attr('content',vpString);
  }
  $('#content').height($(window).height());
  $('#footer').width($(window).width()-20);
  $('#footerMain').width($('#footer').outerWidth()-$('#footerLeft').outerWidth()-$('#footerRight').outerWidth()-24); // TODO not sure why the 24 is needed
  $('#footer').height($(window).height()-10);
  $('#footerLeft').height($('#footer').height()-100);
  $('#footerRight').height($('#footer').height()-100);
  if($('#banner').css('display')=='none'){ // banner is showing
    $('#footer').css('top','10px');
  }else{
    log('resizePage: window height: '+$(window).height());
    log('resizePage: content height: '+$('#content').height());
    log('resizePage: banner height: '+$('#banner').height());
    var top=$(window).height()-$('#banner').height();
    log('resizePage: footer top: '+top);
    $('#footer').css('top',top);
  }
  popcorn.video.height=$(window).height()/2.5;
  popcorn.video.width=popcorn.video.height*1.8;
}
function setVidsDivTop(vidsDivHeight){
  log('setVidsDivTop');
  //vidsDivTop=$('#list').height()/2-vidsDivHeight/2+vidsDivTop;
  if(vidsDivTop<$('#banner').height()+10)vidsDivTop=$('#banner').height()+10;
  vidsDiv.css('top',vidsDivTop);
}
function getVidsDivHeight(){
  var total=0;
  var vidDivCount=0;
  for(var i=0;i<vidsDiv.children().length;i++){
    if($(vidsDiv.children()[i]).hasClass('vidDiv')){
      if(vidDivCount==0){
        //log('increasing content height by '+$(vidsDiv.children()[i]).outerHeight());
        total+=$(vidsDiv.children()[i]).outerHeight();
      }
      vidDivCount++;
      if(vidDivCount==13){
        // TODO base this on window width instead of 13 video divs 
        vidDivCount=0;
      }
    }
  }
  return total;
}
function removeTransitionEffect(){
  if($('#vidsDiv').css('top').substring(0,$('#vidsDiv').css('top').length-2)!=$('#banner').height()+10)setTimeout(removeTransitionEffect,100);
  else{
    log('removeTransitionEffect');
    $('#vidsDiv').css('transition','');
    $('#vidsDiv').css('-webkit-transition','');
  }
}