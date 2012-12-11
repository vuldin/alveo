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
var server=require('http').createServer(function(req,response){
  var path=req.url,
      contentType='';
  if(path=='/'){
    path='/index.html';
  }
  contentType=mime.lookup(path);
  //console.log(path+'\t'+contentType);
  fs.readFile('..'+path,function(err,content){
    response.writeHead(200,{'Content-Type':contentType});
    response.write(content);
    response.end();
  });
  //console.log(req.headers['user-agent']);
});
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
server.listen(8888);
console.log('running at http://127.0.0.1:8888/');
var everyone = nowjs.initialize(server);
//var options={"follow_symlinks":true,"max_depth:":1};
if(typeof localStorage==='undefined'||localStorage===null){
  var LocalStorage=require('node-localstorage').LocalStorage;
  localStorage=new LocalStorage('./scratch');
}
if(!localStorage.getItem('top')){
  var options={"follow_symlinks":true};
  var emitter=walk('../video',options);
  var top={
   'name':'toplevel',
   'path':'../video',
   'url':'http://wiivid:9000/',
   'lastmod':'',
   'subdirs':new Array(),
   'vids':new Array()
  };
  emitter.on('directory',function(dirpath,stat){
    if(dirpath.indexOf("/.")==-1){
      var vids=new Array();
      var subdirs=new Array();
      var dir={
          'name':   dirpath.substring(dirpath.lastIndexOf('/')+1,dirpath.length),
          'path':   dirpath,
          'url':    dirpath.replace(dirpath.substring(0,dirpath.indexOf('video')+6),mediaserverUrl),
          'lastmod':stat.atime,
          'subdirs':subdirs,
          'vids':   vids
          };
      if(dirSearch(dirpath,top.subdirs)==-1){
        // dir not found
        //console.log('new dir');
        var parentPath=dir.path.substring(0,dir.path.lastIndexOf('/'));
        var parent=dirSearch(parentPath,top.subdirs);
        if(parent==-1){
          // add to top
          //console.log('this is a top level directory');
          top.subdirs.push(dir);
        }
        else{
          // add to parent
          //console.log('adding to parent');
          //console.log(parent.path);
          //console.log('\t'+dir.name);
          parent.subdirs.push(dir);
        }
      }
    }
  });
  emitter.on('file',function(vidpath,stat){
    // ignore hidden files
    if(vidpath.indexOf('/.')==-1){
      var vid={
          'name':vidpath.substring(vidpath.lastIndexOf('/')+1,vidpath.lastIndexOf('.')),
          'path':vidpath,
          'url':vidpath.replace(vidpath.substring(0,vidpath.indexOf('video')+6),mediaserverUrl),
          'lastmod':stat.atime,
          'mime':mime.lookup(vidpath),
          'timePlayed':0,
          'omdb':-1, // will be !-1 if one value is returned from omdb
          'omdbResults':-1, // will be !-1 if multiple values are returned from omdb
          'omdbError':-1,
          'metascore':-1
          };
      if(dirSearch(vidpath,top.subdirs)==-1){
        // dir not found
        //console.log('new vid');
        var parentPath=vid.path.substring(0,vid.path.lastIndexOf('/'));
        var parent=dirSearch(parentPath,top.subdirs);
        if(parent==-1){
          // add to top
          //console.log('this is a top level video');
          top.vids.push(vid);
        }
        else{
          // add to parent
          //console.log('adding to parent');
          //console.log(parent.path);
          //console.log('\t'+vid.name);
          parent.vids.push(vid);
        }
      }
    }
  });
  emitter.on('end',function(){
    console.log('dirwalk done');
    sortDir(top);
    console.log(JSON.stringify(top));
    localStorage.setItem('top',JSON.stringify(top));
    //waitforDefined(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
    //omdbFindVid(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
    //omdbFindVid(_sVidSearch('http://wiivid:9000/lane/The Adventures Of Walker And Ping Ping - The Chinese Market (2008).mp4'));
    //omdbFindVid(_sVidSearch('http://wiivid:9000/lane/Journey To The East - The River Dragon King (2008)/Journey To The East - The River Dragon King (2008) - pt1.mp4'));
    //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Inglourious Basterds (2009).mp4'));
  });
}else{
  //localStorage._deleteLocation();
  top=JSON.parse(localStorage.getItem('top'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Star Trek (2009).mp4'));
  //omdbFindVid(_sVidSearch('http://wiivid:9000/action/Inglourious Basterds (2009).mp4'));
}
function omdbFindVid(vid){
  if(vid.omdb==-1&&vid.omdbResults==-1&&vid.omdbError==-1){
    // vid has no omdb metadata
    var series='';
    var title='';
    var year='';
    var reqUrl='';
    if(vid.path.match(/\s-\s[Ss][0-9]{2,3}[Ee][0-9]{2,3}\s-\s/)){
      // is in episodes folder (name is [series] - [SEnum] - title)
      series=vid.name.substring(0,vid.name.indexOf('-')-1);
      title=vid.name.substring(vid.name.lastIndexOf('-')+2,vid.name.length);
    }
    if(vid.name.substring(vid.name.lastIndexOf(')')-4,vid.name.lastIndexOf(')')).match(/^\d{4}$/)!=null){
      // name contains a year
      title=vid.name.substring(0,vid.name.lastIndexOf('(')-1);
      year=vid.name.substring(vid.name.lastIndexOf(')')-4,vid.name.lastIndexOf(')'));
    };
    if(title.match(/\s-\s/)){
      // split title with series
      series=title.substring(0,title.indexOf(' -'));
      title=title.substring(title.indexOf(' - ')+3,title.length);
    }
    /*
    console.log('|'+series+'|');
    console.log('|'+title+'|');
    console.log('|'+year+'|');
    */
    reqUrl='http://www.omdbapi.com/?s='+series+'&t='+title+'&y='+year+'&tomatoes=true&callback=?';
    //reqUrl='http://www.omdbapi.com/?s='+series+'&t='+title+'&y='+year+'&callback=?';
    console.log(reqUrl);
    $.getJSON(reqUrl,function(data){
      if(data.Error){
        console.log('error or no results');
        vid.omdbError=data;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('top',JSON.stringify(top));
      }
      if(data.Search){
        console.log('multiple results ('+data.Search.length+')');
        vid.omdbResults=data.Search;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('top',JSON.stringify(top));
      }
      if(data.Title){
        console.log('single result');
        vid.omdb=data;
        //everyone.now.sUpdateVid(vid);
        localStorage.setItem('top',JSON.stringify(top));
      }
    });
  }else{
    // vid has omdb metadata
    if(vid.omdb!=-1)console.log('local result: '+vid.omdb.Plot);
    if(vid.omdbResults!=-1){
      console.log('local multiple results');
      console.log(vid.omdbResults);
    }
    if(vid.omdbError!=-1){
      console.log('local omdb error: '+vid.omdbError.Error);
    }
  }
}
everyone.now.sBackup=function(top){
  /*
  console.log('playing '+vid.name+' at '+val);
  var thisVid=_sVidSearch(vid.url);
  var parentPath=vid.path.substring(0,vid.path.lastIndexOf('/'));
  var parent=dirSearch(parentPath,top.subdirs);
  parent.vids.splice(parent.vids.indexOf(thisVid),0,vid);
  */
  localStorage.setItem('top',JSON.stringify(top));
};
everyone.now.sGetList=function(){
  everyone.now.cCreateDirectoryList(top);
};
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
  //console.log(result);
  //console.log('search result: '+result.path);
  return result;
}
var results=new Array();
function addResult(result){
  results.push(result);
  //console.log('adding '+result.name+' (results: '+results.length+')');
}
everyone.now.sVidSearch=function(url){
  everyone.now.cVidSearch(_sVidSearch(url));
};
function _sVidSearch(url){
  /*
   * created as a wrapper to the vidSearch function to handle an array of results
   */
  results=new Array();
  var result=-1;
  vidSearch(url);
  //vidSearchWait();
  for(var i=0;i<results.length;i++){
    //console.log(results[i]);
    if(results[i]!=undefined)result=results[i];
  }
  return result;
}
function vidSearch(url,array){
  //var result=-1;
  if(array==undefined)array=top.subdirs;
  //console.log('vid search: '+url);
  dirloop:for(var i=0;i<array.length;i++){
    if(url.indexOf(array[i].url)>-1){
      //console.log('partial match');
      vidloop:for(var j=0;j<array[i].vids.length;j++){
        //console.log('currentVid: '+array[i].vids[j].name);
        if(url==array[i].vids[j].url){
          //console.log('match found: '+array[i].vids[j].name);
          //result=array[i].vids[j];
          addResult(array[i].vids[j]);
        }
        //if(results.length>0)break vidloop;
        //if(result!=-1)break vidloop;
      }
      //console.log('searching for subdirs of '+array[i].url);
      //if(results.length>0)break dirloop;
      //if(results!=-1)break dirloop;
      vidSearch(url,array[i].subdirs);
    }
  }
  //if(result!=-1&&result!=undefined)return result;
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
/*
var searchCount=0;
function getSearchCount(){
  return searchCount;
}
function setSearchCount(num){
  console.log('search: from '+searchCount+' to '+num);
  searchCount=num;
}
function vidSearchWait(){
  if(getSearchCount()>0){
    console.log('waiting on vidSearch');
    setTimeout(vidSearchWait, 200);
  }
}
function waitforDefined(variable){
  if(variable==undefined){
    console.log('waiting on '+variable);
    setTimeout(waitforDefined, 1000);
  }
}
*/