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
  //addPopcornEvents();
  $('#consoleWrapper').on('click touchstart',function(){
    $('#console').toggle();
  });
  if(navigator.userAgent.match(/(Nintendo WiiU)/)){
    // print to log on every touch event
    /*
    $(document).on('touchstart',function(e){
      e.preventDefault();
      var touch=e.touches[0];
      log('touchstart: '+touch.pageX +'/'+touch.pageY);
    });
    */
    document.addEventListener('touchstart',function(e){
      e.preventDefault();
      var touch=e.touches[0];
      log('touchstart: '+touch.pageX +'/'+touch.pageY);
    },false);
    document.addEventListener('touchmove',function(e){
      e.preventDefault();
      var touch=e.touches[0];
      log('touchmove: '+touch.pageX +'/'+touch.pageY);
    },false);
    document.addEventListener('touchend',function(e){
      e.preventDefault();
      var touch=e.touches[0];
      log('touchend: '+touch.pageX +'/'+touch.pageY);
    },false);
    document.addEventListener('touchcancel',function(e){
      e.preventDefault();
      var touch=e.touches[0];
      log('touchcancel: '+touch.pageX +'/'+touch.pageY);
    },false);
  }
  $('#banner').on('mouseup',function(event){
    event.stopPropagation();
    var prevDir=$('#toplevelDirs').siblings().last().prev().children('.selectedDir');
    if(prevDir.text().length>0){
      //log('initlayout: displaying '+prevDir.text()+' vids');
      prevDir.mouseup();
    }else{
      log('initlayout: resetting');
      initialDirDiv.detach(); // detach before emptying parent or event handling will be removed 
      $('#toplevelDirs').empty();
      initialDirDiv.appendTo($('#toplevelDirs'));
      populateVids();
    }
  });
  $('#vidsDiv').draggable({axis:'y'});
  $('#vidsDiv').on('dragstart',function(event){
    drag=true;
    log('events: list dragstart/touchmove');
    clearTimeout(mousedownTimeout);
    if($('#toplevelDirs').nextAll().last().children('.hiddenDir').length==0){ // last dirlist isn't being used... remove it 
      $('#toplevelDirs').nextAll().last().empty();
      $('#toplevelDirs').nextAll().last().remove();
    }
  });
  $('#vidsDiv').on('dragstop',function(event){
    log('events: vidsDiv top: '+$(this).css('top'));
    if($(this).css('top').substring(0,$(this).css('top').length-2)<$('#banner').height()+10){
      // TODO handle transition to bottom of vidsDiv taking into account -top value, vidsDiv height, and list height 
      //log('initLayout: vidsDiv height is '+getVidsDivHeight());
      //log('initLayout: list height is '+$('#list').height());
      if($('#list').height()<getVidsDivHeight())log('vidsDiv is not fully shown');
      $(this).css('transition','top 300ms ease-in-out');
      $(this).css('-webkit-transition','top 300ms ease-in-out');
      $(this).css('top',$('#banner').height()+10+'px');
      removeTransitionEffect();
    }
  });
  $('#footerTop').on('mouseup',function(event){
    $('#banner').toggle();
    resizePage();
  });
});
function addVidDivEvents(vidDiv,vid){
  vidDiv.on('mousedown',function(event){
    mousedownTimeout=setTimeout(function(){
      drag=false;
    },1000);
  });
  vidDiv.on('mouseup',function(event){
    if(!drag){
      event.stopPropagation();
      //log('createVidDiv: '+vid.name);
      //log('createVidDiv: '+vid.url);
      showVidDetails(vid);
      $('#playButton').on('mouseup',function(event){
        //playVid(vid);
        $($('#video').children()[0]).attr('src',vid.url);
        setTimePlayed=function(){_setTimePlayed(vid);};
        console.log(popcorn);
        console.log(vid);
        addPopcornEvents(vid);
        popcorn.load();
        popcorn.play();
        now.sAddRecent(vid);
      });
    }
  });
}
function addPopcornEvents(vid){
  log('addPopcornEvents');
  log('addPopcornEvents: timePlayed '+vid.timePlayed);
  // http://popcornjs.org/popcorn-docs/events/
  popcorn.on('abort',function(){
    log('abort');
  });
  popcorn.on('dataunavailable',function(){
    log('dataunavailable');
  });
  popcorn.on('durationchange',function(){
    log('durationchange');
  });
  popcorn.on('ended',function(){
    log('video has ended');
  });
  popcorn.on('emptied',function(){
    log('emptied');
    playing=false;
  });
  popcorn.on('empty',function(){
    log('empty');
  });
  popcorn.on('ended',function(){
    log('ended');
  });
  popcorn.on('error',function(event){
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
    log('error');
    log(event.srcElement.error);
  });
  popcorn.on('loadeddata',function(){
    log('loadeddata');
  });
  popcorn.on('loadedmetadata',function(){
    log('loadedmetadata');
    //popcorn.media.currentTime=currentVid.timePlayed;
    //popcorn.media.currentTime=vid.timePlayed;
    log('setting vid start time to '+vid.timePlayed);
    popcorn.currentTime(vid.timePlayed);
    if(vid.duration==0){
      log('popcorn loadedmetadata event: duration '+popcorn.media.duration);
      vid.duration=popcorn.media.duration;
    }
    now.sBackup(vid);
  });
  popcorn.on('pause',function(){
    log('pause');
    playing=false;
  });
  popcorn.on('playing',function(event){
    log('playing');
    playing=true;
    log('popcorn playing event: '+popcorn.media.currentTime);
    setTimePlayed();
  });
  popcorn.on('progress',function(event){
    //log('progress');
  });
  popcorn.on('suspend',function(){
    //log('suspend');
  });
  popcorn.on('timeupdate',function(){
    //log('timeupdate');
  });
  popcorn.on('waiting',function(){
    log('waiting');
  });
}