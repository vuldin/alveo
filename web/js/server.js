var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now'),
    mime=require('mime'),
    $=require('jquery');
/*
var vidStreamer = require('vid-streamer');
var vidstreamSettings={
    "mode": "development",
    "forceDownload": false,
    "random": true,
    "rootFolder": "/video/",
    "rootPath": "/video/",
    "server": "VidStreamer.js/0.1.2"
};
//var vidstreamer = require('http').createServer(vidStreamer.settings(vidstreamSettings));
var vidstreamer = require('http').createServer(vidStreamer);
vidstreamer.listen(3000);
console.log("vidstreamer running port 3000");
console.log(vidstreamer);
var BinaryServer=require('binaryjs').BinaryServer;
// Start Binary.js server
var mediaserver=BinaryServer({port:9000});
// Wait for new user connections
mediaserver.on('connection',function(client){
  // Stream a flower as a hello!
  console.log(__dirname);
  var file = fs.createReadStream('../video/theoratest.ogg');
  client.send(file);
});
*/
var mediaserverUrl="http://wiivid:9000/";
var server=require('http').createServer(function(req,resp){
  var path=req.url,
      contentType='';
  if(path=='/')path='/index.html';
  path='..'+path;
  contentType=mime.lookup(path);
  //console.log(path+'\t'+contentType);
  //console.log(req.headers['user-agent']);
  /*
  if(req.method!=='GET'){
    resp.writeHead(400);
    resp.end();
    return;
  }
  var stream=fs.createReadStream(path);
  stream.on('error',function(){
    resp.writeHead(404,{'Content-Type':'text/plain'});
    resp.write('404 Not Found\n');
    resp.end();
  });
  stream.once('fd',function(){
    req.writeHead(200,{'Content-Type':contentType});
  });
  stream.pipe(resp);
  */
  fs.readFile(path,function(err,content){
    resp.writeHead(200,{'Content-Type':contentType});
    //resp.write(content);
    resp.end(content,'utf-8');
  });
}).listen(8888);
console.log('running at http://127.0.0.1:8888/');
/*
// https://groups.google.com/forum/?fromgroups=#!topic/nodejs/gzng3IJcBX8
var range=request.headers.range;
var total=file.length;
var parts=range.replace(/bytes=/,'').split('-');
var partialstart=parts[0];
var partialend=parts[1];
var start=parseInt(partialstart,10);
var end=partialend ? parseInt(partialend,10):total-1;
var chunksize=(end-start)+1;
response.writeHead(206,{'Content-Range':'bytes '+start+'-'+end+'/'+total,'Accept-Ranges':'bytes','Content-Length':chunksize,'Content-Type':type});
response.end(file.slice(start,end),'binary'); 
*/
var options={"follow_symlinks":true};
var emitter=walk('../video',options);
var everyone = nowjs.initialize(server);
var data=null;
var recent=null;
var vidSearchResults=new Array();
//var options={"follow_symlinks":true,"max_depth:":1};
if(typeof localStorage==='undefined'||localStorage===null){
  var LocalStorage=require('node-localstorage').LocalStorage;
  localStorage=new LocalStorage('./scratch');
}
if(!localStorage.getItem('data')){
  data={
   'name':'toplevel',
   'path':'../video',
   'url':'http://wiivid:9000/',
   'lastmod':'',
   'subdirs':new Array(),
   'vids':new Array()
  };
}else{
  //localStorage._deleteLocation();
  data=JSON.parse(localStorage.getItem('data'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Star Trek (2009).mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Inglourious Basterds (2009).mp4'));
  //omdbFindVid(vidSearch('http://localhost:9000/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
  //omdbFindVid(vidSearch('http://wiivid:9000/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
}
resetFound();
if(!localStorage.getItem('recent')){
  recent={
      'vids':new Array()
  };
}else{
  recent=JSON.parse(localStorage.getItem('recent'));
}
emitter.on('directory',function(dirpath,stat){
  if(dirpath.indexOf("/.")==-1){ // only non-hidden files
    var dir=dirSearch(dirpath,data.subdirs);
    if(dir==-1){ // only if it doesn't already exist in data
      var vids=new Array();
      var subdirs=new Array();
      var dir={
          'name':   dirpath.substring(dirpath.lastIndexOf('/')+1,dirpath.length),
          'path':   dirpath,
          'url':    dirpath.replace(dirpath.substring(0,dirpath.indexOf('video')+6),mediaserverUrl),
          'lastmod':stat.atime,
          'found':  true,
          'subdirs':subdirs,
          'vids':   vids
      };
      var parentPath=dir.path.substring(0,dir.path.lastIndexOf('/'));
      var parent=dirSearch(parentPath,data.subdirs);
      if(parent==-1){
        // add to data
        //console.log('this is a top level directory');
        data.subdirs.push(dir);
      }
      else{
        // add to parent
        //console.log('adding to parent');
        //console.log(parent.path);
        //console.log('\t'+dir.name);
        parent.subdirs.push(dir);
      }
    }else{
      dir.found=true;
      dir.lastmod=stat.atime;
      /*
      // this always was true anyway...
      if(dir.lastmod!=stat.atime){
        console.log('updating lastmod for dir: '+dir.name);
      }
      */
    }
  }
});
emitter.on('file',function(vidpath,stat){
  // ignore hidden files
  if(vidpath.indexOf('/.')==-1){
    var vid=vidSearch(vidpath.replace(vidpath.substring(0,vidpath.indexOf('video')+6),mediaserverUrl));
    if(vid==-1){
      console.log('new vid: '+vidpath);
      vid={
          'name':vidpath.substring(vidpath.lastIndexOf('/')+1,vidpath.lastIndexOf('.')),
          'path':vidpath,
          'url':vidpath.replace(vidpath.substring(0,vidpath.indexOf('video')+6),mediaserverUrl),
          'lastmod':stat.atime,
          'found':true,
          'mime':mime.lookup(vidpath),
          'timePlayed':0,
          'duration':0,
          'omdb':-1, // will be !-1 if one value is returned from omdb
          'omdbResults':-1, // will be !-1 if multiple values are returned from omdb
          'omdbError':-1,
          'metascore':-1
          };
      if(dirSearch(vidpath,data.subdirs)==-1){ // dir not found
        var parentPath=vid.path.substring(0,vid.path.lastIndexOf('/'));
        var parent=dirSearch(parentPath,data.subdirs);
        if(parent==-1){
          console.log('this is a top level video');
          data.vids.push(vid);
        }
        else parent.vids.push(vid);
      }
    }else{
      vid.found=true;
      var newmod=new Date(stat.atime);
      if(vid.lastmod!=newmod.toISOString()){
        console.log('updating lastmod for vid: '+vid.name);
        vid.lastmod=stat.atime;
      }
    }
  }
});
emitter.on('end',function(){
  console.log('fswalk done');
  sortDir(data);
  //console.log(JSON.stringify(data,null,2));
  localStorage.setItem('data',JSON.stringify(data));
  //waitforDefined(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/lane/The Adventures Of Walker And Ping Ping - The Chinese Market (2008).mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/lane/Journey To The East - The River Dragon King (2008)/Journey To The East - The River Dragon King (2008) - pt1.mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Inglourious Basterds (2009).mp4'));
});
function resetFound(array){ // sets all dirs/vids found variable to false
  if(array==undefined)array=data.subdirs;
  $.each(array,function(dirkey,dir){
    dir.found=false;
    $.each(dir.vids,function(vidkey,vid){
      vid.found=false;
    });
    resetFound(dir.subdirs);
  });
}
function omdbFindVid(vid){
  // TODO need to handle not finding the vid
  console.log('omdbFindVid');
  console.log(vid);
  if(vid.omdb==-1&&vid.omdbResults==-1&&vid.omdbError==-1){ // vid has no omdb metadata yet
    var series='';
    var title='';
    var year='';
    var reqUrl='';
    if(vid.path.match(/\s-\s[Ss][0-9]{2,3}[Ee][0-9]{2,3}\s-\s/)){ // is in episodes folder (name is [series] - [num] - title)
      console.log('episode');
      series=vid.name.substring(0,vid.name.indexOf('-')-1);
      title=vid.name.substring(vid.name.lastIndexOf('-')+2,vid.name.length);
    }
    if(vid.name.substring(vid.name.lastIndexOf(')')-4,vid.name.lastIndexOf(')')).match(/^\d{4}$/)!=null){ // name contains a year
      console.log('contains year');
      title=vid.name.substring(0,vid.name.lastIndexOf('(')-1);
      year=vid.name.substring(vid.name.lastIndexOf(')')-4,vid.name.lastIndexOf(')'));
    };
    if(title.match(/\s-\s/)){ // split title with series
      console.log('contains series');
      series=title.substring(0,title.indexOf(' -'));
      title=title.substring(title.indexOf(' - ')+3,title.length);
    }
    console.log('|'+series+'|');
    console.log('|'+title+'|');
    console.log('|'+year+'|');
    reqUrl='http://www.omdbapi.com/?s='+series+'&t='+title+'&y='+year+'&tomatoes=true&callback=?';
    //reqUrl='http://www.omdbapi.com/?s='+series+'&t='+title+'&y='+year+'&callback=?';
    console.log(reqUrl);
    $.getJSON(reqUrl,function(searchResult){
      if(searchResult.Error){
        console.log('error or no results');
        vid.omdbError=searchResult;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('searchResult',JSON.stringify(searchResult));
      }
      if(searchResult.Search){
        console.log('multiple results ('+searchResult.Search.length+')');
        vid.omdbResults=searchResult.Search;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('searchResult',JSON.stringify(searchResult));
      }
      if(searchResult.Title){
        console.log('single result');
        vid.omdb=searchResult;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('searchResult',JSON.stringify(searchResult));
      }
    });
  }else{
    // vid has omdb metadata
    if(vid.omdb!=-1){
      console.log('local result');
      console.log(vid.omdb);
      //console.log('local result: '+vid.omdb.Plot);
    }
    if(vid.omdbResults!=-1){
      console.log('multiple local results');
      console.log(vid.omdbResults);
    }
    if(vid.omdbError!=-1){
      console.log('local omdb error: '+vid.omdbError.Error);
    }
  }
}
//everyone.now.sBackup=function(data,vid){
everyone.now.sBackup=function(vid){
  //console.log(vid.name+': '+vid.timePlayed);
  //console.log(vid.url);
  var currentVid=vidSearch(vid.url);
  var parentPath=vid.path.substring(0,vid.path.lastIndexOf('/'));
  var parent=dirSearch(parentPath,data.subdirs);
  //var index=parent.vids.indexOf(currentVid);
  //console.log(index+'/'+parent.vids.length);
  //console.log(JSON.stringify(parent.vids[index],null,2));
  parent.vids.splice(parent.vids.indexOf(currentVid),1,vid);
  //console.log('length: '+parent.vids.length);
  //console.log(JSON.stringify(parent.vids,null,2));
  localStorage.setItem('data',JSON.stringify(data));
  everyone.now.cGetData(data);
};
everyone.now.sAddRecent=function(recentvid){
  console.log(recentvid);
  //var match=false;
  //if(recent.length>20)recent.splice(0,1);
  //$.each(recent,function(key,recentvid){
  for(var i=0;i<recent.vids.length;i++){
    //if(recentvid.url==recent.vids[i].url&&recentvid.name==recent.vids[i].name){
    if(recentvid.name==recent.vids[i].name){
      //console.log(vidurl+' already added to recent list at '+i);
      recent.vids.splice(i,1);
    }
  }
  //if(!match){
    //recent.push(vid);
  if(recent.vids.length>1)recent.vids.splice(0,0,recentvid);
  else recent.vids.push(recentvid);
  //}
  //console.log(recent);
  localStorage.setItem('recent',JSON.stringify(recent));
  this.now.cGetRecent(recent);
};
everyone.now.sGetRecent=function(){
  console.log('sGetRecent at '+new Date()+' from: '+this.user.clientId);
  this.now.cGetRecent(recent);
}
everyone.now.sGetData=function(){
  console.log('sGetRecent at '+new Date()+' from: '+this.user.clientId);
  this.now.cGetData(data);
};
everyone.now.sGetMediaServerUrl=function(){
  this.now.cGetMediaServerUrl(mediaserverUrl);
}
function dirSearch(path,array){
  //console.log('search request: '+path);
  var result=-1;
  for(var i=0;i<array.length;i++){
    if(path.indexOf(array[i].path)>-1){
      //console.log('partial path found');
      if(path==array[i].path){
        //console.log('match found');
        result=array[i];
        break;
      }
      result=dirSearch(path,array[i].subdirs);
    }
  }
  //console.log('search result: '+result.path);
  return result;
}
everyone.now.sVidSearch=function(url){
  console.log('sVidSearch at '+new Date()+' from: '+this.user.clientId);
  //everyone.now.cVidSearch(vidSearch(url));
  this.now.cVidSearch(vidSearch(url));
};
function vidSearch(url,array){
  //vidSearchResults=new Array();
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
        if(url==vid.url)addVidResult(vid);
      });
      vidSearch(url,dir.subdirs);
    }
  });
}
function addVidResult(val){
  vidSearchResults.push(val);
}
function sortDir(dir){
  dir.subdirs.sort(function(a,b){
    return a.path.localeCompare(b.path);
  });
  for(var i=0;i<dir.subdirs.length;i++){
    sortDir(dir.subdirs[i]);
  }
  dir.vids.sort(function(a,b){
    return a.path.localeCompare(b.path);
  });
}