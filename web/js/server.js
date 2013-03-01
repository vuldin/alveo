var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now'),
    mime=require('mime'),
    $=require('jquery');
var config=JSON.parse(fs.readFileSync(__dirname+'/../../config.json','utf8',function(error,data){
  if(error)throw error;
}));
var serverName=config.serverName;
var serverPort=config.serverPort;
var appPort=config.appPort;
var serverUrl='http://'+serverName+':'+serverPort+'/';
var server=require('http').createServer(function(req,res){
  res.writeHead(404);
  res.end('404 Not Found\n');
}).listen(appPort);
console.log('running at '+appPort);
var options={'follow_symlinks':true};
//var appDir=process.cwd().substring(0,process.cwd().indexOf(serverName)+serverName.length);
var appDir=__dirname.substring(0,__dirname.lastIndexOf('/'));
appDir=appDir.substring(0,appDir.lastIndexOf('/'));
var vidDir=appDir+'/web/video';
var emitter=walk(vidDir,options); // TODO use a walker that targets the http server (instead of filesystem directly)
var everyone = nowjs.initialize(server);
var data=null;
var recent=null;
if(typeof localStorage==='undefined'||localStorage===null){
  var Storage=require('dom-storage');
  localStorage=new Storage(appDir+'/db.json');
}
if(!localStorage.getItem('data')){
  data={
   'name':'toplevel',
   'path':vidDir,
   'url':serverUrl,
   'lastmod':'',
   'subdirs':new Array(),
   'vids':new Array()
  };
}else{
  //localStorage._deleteLocation();
  data=JSON.parse(localStorage.getItem('data'));
  //omdbFindVid(_sVidSearch(serverUrl+'episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/action/Star Trek (2009).mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/action/Inglourious Basterds (2009).mp4'));
  //omdbFindVid(vidSearch('http://localhost:9000/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
  //omdbFindVid(vidSearch('http://webmedsvr:9000/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
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
    //var dirUrl=dirpath.replace(dirpath.substring(0,dirpath.indexOf('video')+6),serverUrl);
    var dirUrl=dirpath.replace(dirpath.substring(0,dirpath.indexOf('video')),serverUrl);
    //console.log('dirUrl: '+dirUrl);
    var dir=data.find({url:dirUrl});
    if(!dir){ // only if it doesn't already exist in data
      var vids=new Array();
      var subdirs=new Array();
      var dir={
        'name':   dirpath.substring(dirpath.lastIndexOf('/')+1,dirpath.length),
        'path':   dirpath,
        'url':    dirUrl,
        'lastmod':stat.atime,
        'found':  true,
        'subdirs':subdirs,
        'vids':   vids
      };
      var parentUrl=dir.url.substring(0,dir.url.lastIndexOf('/'));
      var parent=data.find({url:parentUrl});
      if(!parent){
        //console.log('this is a top level directory');
        data.subdirs.push(dir);
      }
      else{
        //console.log('adding to parent');
        parent.subdirs.push(dir);
      }
    }else{
      dir.found=true;
      dir.lastmod=stat.atime;
    }
  }
});
emitter.on('file',function(vidpath,stat){
  if(vidpath.indexOf('/.')==-1){ // ignore hidden files
    //console.log('vidpath: '+vidpath);
    //var vidUrl=vidpath.replace(vidpath.substring(0,vidpath.indexOf('video')+6),serverUrl);
    var vidUrl=vidpath.replace(vidpath.substring(0,vidpath.indexOf('video')),serverUrl);
    //console.log('vidUrl: '+vidUrl);
    var vid=data.find({url:vidUrl});
    if(!vid){ // new vid
      var series='';
      var season='';
      var episode='';
      var title='';
      var year='';
      var name=vidpath.substring(vidpath.lastIndexOf('/')+1,vidpath.lastIndexOf('.'));
      if(name.match(/\s-\s[Ss][0-9]{2,3}[Ee][0-9]{2,3}[Ee]{0,1}[0-9]{0,3}\s-\s/)){ // is episode (name is [series] - [num] - title)
        series=name.substring(0,name.indexOf('-')-1);
        episode=name.substring(name.indexOf('-')+2,name.length);
        title=episode.substring(episode.indexOf('-')+2,episode.length);
        episode=episode.substring(0,episode.indexOf('-')-1);
        season=episode.match(/[sS][0-9]{2,3}/)[0];
        season=season.substring(1,season.length);
        if(season.charAt(0)=='0')season=season.substring(1,season.length);
        episode=episode.match(/[eE][0-9]{2,3}(.*?)$/)[0];
        episode=episode.substring(1,episode.length);
        episode=episode.replace(/[Ee]/,'-');
        if(episode.charAt(0)=='0')episode=episode.substring(1,episode.length);
      }else if(title.match(/\s-\s/)){ // need to split series and title
        // TODO need to make this match more stringent
        series=title.substring(0,title.indexOf(' -'));
        title=title.substring(title.indexOf(' - ')+3,title.length);
      }
      if(name.substring(name.lastIndexOf(')')-4,name.lastIndexOf(')')).match(/^\d{4}$/)!=null){ // contains a year
        title=name.substring(0,name.lastIndexOf('(')-1);
        year=name.substring(name.lastIndexOf(')')-4,name.lastIndexOf(')'));
      };
      /*
      console.log('name: |'+name+'|');
      console.log('series: |'+series+'|');
      console.log('season: |'+season+'|');
      console.log('episode: |'+episode+'|');
      console.log('title: |'+title+'|');
      console.log('year: |'+year+'|');
      */
      vid={
        'name':name,
        'series':series,
        'season':season,
        'episode':episode,
        'title':title,
        'year':year,
        'path':vidpath,
        'url':vidUrl,
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
      var parentUrl=vid.url.substring(0,vid.url.lastIndexOf('/'));
      var parent=data.find({url:parentUrl});
      parent.vids.push(vid); // TODO vids is undefined at toplevel 
    }else{
      vid.found=true;
      var newmod=new Date(stat.atime);
      if(vid.lastmod!=newmod.toISOString()){
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
  //waitforDefined(_sVidSearch('http://webmedsvr:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/lane/The Adventures Of Walker And Ping Ping - The Chinese Market (2008).mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/lane/Journey To The East - The River Dragon King (2008)/Journey To The East - The River Dragon King (2008) - pt1.mp4'));
  //omdbFindVid(_sVidSearch('http://webmedsvr:9000/action/Inglourious Basterds (2009).mp4'));
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
    var reqUrl='http://www.omdbapi.com/?s='+vid.series+'&t='+vid.title+'&y='+vid.year+'&tomatoes=true&callback=?';
    //reqUrl='http://www.omdbapi.com/?s='+series+'&t='+title+'&y='+year+'&callback=?';
    console.log(reqUrl);
    $.getJSON(reqUrl,function(searchResult){
      if(searchResult.Error){
        console.log('error or no results');
        vid.omdbError=searchResult;
        //everyone.now.sUpdateVid(vid);
        //localStorage.setItem('searchResult',JSON.stringify(searchResult));
        everyone.now.sBackup(vid);
      }
      if(searchResult.Search){
        console.log('multiple results ('+searchResult.Search.length+')');
        vid.omdbResults=searchResult.Search;
        //everyone.now.sUpdateVid(vid);
        //localStorage.setItem('searchResult',JSON.stringify(searchResult));
        everyone.now.sBackup(vid);
      }
      if(searchResult.Title){
        console.log('single result');
        vid.omdb=searchResult;
        //everyone.now.sUpdateVid(vid);
        //localStorage.setItem('searchResult',JSON.stringify(searchResult));
        everyone.now.sBackup(vid);
      }
    });
  }else{ // vid has omdb metadata
    if(vid.omdb!=-1){
      console.log('omdbFindVid: vid already has local result');
      console.log(vid.omdb);
      //console.log('local result: '+vid.omdb.Plot);
    }
    if(vid.omdbResults!=-1){
      console.log('omdbFindVid: vid already has multiple local results');
      console.log(vid.omdbResults);
    }
    if(vid.omdbError!=-1){
      console.log('omdbFindVid: vid already has local omdb error');
      console.log(vid.omdbError);
    }
  }
}
everyone.now.sBackup=function(vid){
  console.log(vid);
  var currentVid=data.find({url:vid.url});
  var parentUrl=vid.url.substring(0,vid.url.lastIndexOf('/'));
  console.log('parentUrl: '+parentUrl);
  var parent=data.find({url:parentUrl});
  //console.log('parent vids length: '+parent.vids.length);
  console.log('vid index: '+parent.vids.indexOf(currentVid));
  parent.vids.splice(parent.vids.indexOf(currentVid),1,vid);
  console.log('new vid: ',parent.vids[parent.vids.indexOf(vid)]);
  console.log('new data: ',data.subdirs[1]);
  localStorage.setItem('data',JSON.stringify(data));
  everyone.now.cGetData(data);
};
everyone.now.sAddRecent=function(recentvid){
  for(var i=0;i<recent.vids.length;i++){
    if(recentvid.series!=''&&recentvid.series==recent.vids[i].series)recent.vids.splice(i,1); //remove existing vid if it is from same series
    else if(recentvid.name==recent.vids[i].name)recent.vids.splice(i,1); //remove existing vid if it has same name
  }
  recent.vids.reverse();
  recent.vids.push(recentvid);
  recent.vids.reverse();
  localStorage.setItem('recent',JSON.stringify(recent));
  this.now.cGetRecent(recent);
};
everyone.now.sGetRecent=function(){
  console.log(new Date(),'sGetRecent from '+this.user.clientId);
  this.now.cGetRecent(recent);
}
everyone.now.sGetData=function(){
  console.log(new Date(),'sGetData from '+this.user.clientId);
  this.now.cGetData(data);
};
everyone.now.sGetMediaServerUrl=function(){
  this.now.cGetMediaServerUrl(serverUrl);
}
Object.prototype.find=function(keyObj){
  var prop,key,val,tRet;
  for(prop in keyObj){
    if(keyObj.hasOwnProperty(prop)){
      key=prop;
      val=keyObj[prop];
    }
  }
  for(prop in this){
    if(prop==key){
      if(this[prop]==val){
        return this;
      }
    }else if(this[prop] instanceof Object){
      if(this.hasOwnProperty(prop)){
        tRet=this[prop].find(keyObj);
        if(tRet){return tRet;}
      }
    }
  }
  return false;
};
function sortDir(dir){
  // TODO look into automatically sorting the array
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