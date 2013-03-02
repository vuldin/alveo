var data=-1; // main data containing all directory and video information
var recent=-1; // recently played videos
var queue=-1; // saved videos for future playback
//var vidDetails=-1; // result from server of a request for video metadata
var vidsDivTop=0;
var dirSearchResults=new Array();
var vidSearchResults=new Array();
var playing=false;
//var currentVid=-1;
//var mediaserverUrl=-1;
var volume=0;
var popcorn=-1;
var mousedownTimeout=null;
var drag=false;
var initialDirDiv=null;
var setTimePlayed=null;
$(function(){
  log('document.ready');
  popcorn=Popcorn('#video');
  //addPopcornEvents();
  //resizePage();
  initialDirDiv=$('#initialDirDiv');
  /*
  if(window.wiiu){
    log(JSON.stringify(window.wiiu.gamepad));
  }
  */
  now.ready(function(){
    //log('now.ready');
    now.sGetData();
    now.sGetRecent();
    now.sGetQueue();
    //now.sGetMediaServerUrl();
    initialDirDiv.on('mouseup',function(event){
      event.stopPropagation();
      initialDirDiv.detach(); // detach before emptying parent or event handling will be removed 
      createDirectoryList();
    });
    populateVids();
  });
});
//$(window).on('resize',resizePage);
now.cGetData=function(val){
  data=val;
  //console.info('new data variable from server: ',data);
}
now.cGetRecent=function(val){
  //log('new recent variable from server');
  //console.info('new recent variable: ',val);
  recent=val;
}
now.cGetQueue=function(val){
  queue=val;
}
function createDirectoryList(){
  if(data==-1)setTimeout(createDirectoryList,100);
  else{
    log('createDirectoryList');
    $('#toplevelDirs').empty();
    $('#toplevelDirs').nextAll().empty();
    $('#toplevelDirs').nextAll().remove();
    $.each(data.subdirs,function(key,dir){
      if(dir.subdirs!=undefined)createDirDiv(dir,$('#toplevelDirs'));
    });
  }
}
now.cShowVids=function(dir){
  log('cShowVids server sent vids for '+dir.name);
  //if(dir!=undefined&&dir!=-1&&dir.vids.length>0){ // given directory contains vids
  if(dir.vids.length>0){
    $.each(dir.vids,function(key,vid){
      createVidDiv(vid,vidsDiv);
    });
  }else{
    vidsDivTop+=-19; // TODO dynamically find div height and add to cumulative vidsDivTop variable 
    jQuery('<div/>',{text:'Recent shows:'}).appendTo(vidsDiv).addClass('RecentVidsMsgDiv');
    $.each(recent.vids,function(key,recentvid){
      createVidDiv(recentvid,vidsDiv);
    });
  }
  setVidsDivTop(getVidsDivHeight());
}
function populateVids(dir){
  if(recent==-1||data==-1){
    setTimeout(populateVids,100);
  }else{
    //log('populateVids');
    vidsDivTop=0;
    vidsDiv=$('#vidsDiv');
    vidsDiv.css('position','relative');
    vidsDiv.css('top',$(window).height());
    vidsDiv.css('display','block');
    vidsDiv.empty();
    if(dir&&dir.vids.length>0){
      log('populateVids: current directory vidcount is '+dir.vids.length); 
      $.each(dir.vids,function(key,vid){
        createVidDiv(vid,vidsDiv);
      });
    }else{ // display something other than currentdir vids 
      if(dir!=undefined){
        vidsDivTop+=-19;
        jQuery('<div/>',{text:'No videos found in this directory.'}).appendTo(vidsDiv).addClass('noVidsMsgDiv');
      }
      if(recent.vids.length>0){
        vidsDivTop+=-19;
        jQuery('<div/>',{text:'Recently viewed videos:'}).appendTo(vidsDiv).addClass('RecentVidsMsgDiv');
      }
      $.each(recent.vids,function(key,recentvid){
        createVidDiv(recentvid,vidsDiv);
      });
    }
    setVidsDivTop(getVidsDivHeight());
  }
}
function dirSearch(url,array){
  var result=-1;
  _dirSearch(url,array);
  $.each(dirSearchResults,function(key,val){
    if(val!=undefined)result=val;
  });
  return result;
}
function _dirSearch(url,array){
  if(array==undefined)array=data.subdirs;
  $.each(array,function(dirkey,dir){
    if(url==dir.url)addResult(dir,dirSearchResults);
    dirSearch(url,dir.subdirs);
  });
}
function vidSearch(url,array){
  var result=-1;
  _vidSearch(url,array);
  $.each(vidSearchResults,function(key,val){
    if(val!=undefined)result=val;
  });
  return result;
}
function _vidSearch(url,array){
  if(array==undefined)array=data.subdirs;
  $.each(array,function(dirkey,dir){
    if(url.indexOf(dir.url)>-1){
      $.each(dir.vids,function(vidkey,vid){
        if(url==vid.url)addResult(vid,vidSearchResults);
      });
      vidSearch(url,dir.subdirs);
    }
  });
}
function addResult(val,array){
  array.push(val);
}
function createDirDiv(dir,parentDiv){
  var div={};
  div=jQuery('<div/>',{text:dir.name}).appendTo(parentDiv).addClass('dirDiv');
  div.on('mouseup',function(event){
    event.stopPropagation();
    parentDiv.nextAll().empty();
    parentDiv.nextAll().remove();
    if(div.hasClass('selectedDir')){
      div.removeClass('selectedDir');
      div.siblings().removeClass('hiddenDir');
    }
    else{
      div.addClass('selectedDir');
      div.siblings().addClass('hiddenDir');
      if(dir.subdirs.length>0){ // display subdirs 
        var subdirsdiv=jQuery('<div/>',{}).addClass('dirsDiv');
        subdirsdiv.appendTo(parentDiv.parent());
        var left=subdirsdiv.prev().children('.selectedDir').offset().left+subdirsdiv.prev().width()-6;
        subdirsdiv.css('left',left);
        subdirsdiv.css('z-index',subdirsdiv.prev().css('z-index')-1);
        $.each(dir.subdirs,function(key,subdir){
          createDirDiv(subdir,subdirsdiv);
        });
      }
    }
    populateVids(dir);
  });
}
function createVidDiv(vid,parentDiv){
  var div={};
  div=jQuery('<div/>').appendTo(parentDiv).addClass('vidDiv');
  jQuery('<div/>',{text:vid.title}).appendTo(div).addClass('vidTitleDiv');
  jQuery('<div/>',{text:vid.series}).appendTo(div).addClass('vidSeriesDiv');
  //jQuery('<div/>',{text:'season '+vid.season}).appendTo(div).addClass('vidSeasonDiv');
  //jQuery('<div/>',{text:'(episode '+vid.episode+')'}).appendTo(div).addClass('vidEpisodeDiv');
  addVidDivEvents(div,vid);
}
function showVidDetails(vid){ // empty vidDetails section, populate with this vid details, remove banner and show vidDetails section
  log('showVidDetails: timePlayed '+vid.timePlayed);
  $('#vidDetails').empty();
  vidnameDiv=jQuery('<div/>',{text:vid.name}).appendTo($('#vidDetails')).addClass('vidDetails');
  vidurlDiv=jQuery('<div/>',{text:vid.url}).appendTo($('#vidDetails')).addClass('vidDetails');
  var vidombdDiv=jQuery('<div/>').appendTo($('#vidDetails')).addClass('vidDetails');
  if(vid.omdb!=-1)vidomdbDiv.text(vid.omdb);
  if(vid.omdbResults!=-1){
    $.each(vid.omdbResults,function(key,val){
      jQuery('<div/>',{text:val}).appendTo($('#vidDetails')).addClass('vidDetails');
    });
  }
  if(vid.omdbError!=-1)vidomdbDiv.text(vid.omdbError);
  $('#banner').css('display','none');
  resizePage();
}
function playVid(vid){
  log('playVid: '+vid.url);
  var vidSrc=$($('#video').children()[0]).attr('src');
  $($('#video').children()[0]).attr('src',vid.url);
  setTimePlayed=function(){_setTimePlayed(vid);}; // setTimePlayed used to periodically update vid object's timePlayed
  //popcorn.load();
  //popcorn.play();
  now.sAddRecent(vid);
  /*
  // handle WiiU window size change 
  if(navigator.userAgent.match(/(Nintendo WiiU)/)){
    resizePage();
  }
  */
}
function _setTimePlayed(vid){ // set timePlayed of vid object occasionally during playback
  // TODO if new vid is loaded, then setTimePlayed is called an additional time for each new vid that is loaded on each interval
  //log('setTimePlayed');
  if(playing){
    log('setTimePlayed: '+popcorn.media.currentTime);
    vid.timePlayed=popcorn.media.currentTime;
    now.sBackup(vid);
    setTimeout(setTimePlayed,3000);
  }
}
function isEpisode(val){
  return val.match(/\s-\s[Ss][0-9]{2,3}[Ee][0-9]{2,3}[Ee]{0,1}[0-9]{0,3}\s-\s/);
}
function toggleVolume(vol){
  if(vol!=0){
    volume=document.getElementById('video').volume;
    document.getElementById('video').volume=0;
  }else document.getElementById('video').volume=volume;
}
function fullscreen(){
  log('fullscreen');
  $('body')[0].webkitRequestFullScreen();
}