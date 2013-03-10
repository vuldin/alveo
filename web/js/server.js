/**@license
 * {{project}} <{{homepage}}>
 * Copyright (C) {{year}} {{author}}
 * {{license}}
 */
var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now'),
    mime=require('mime'),
    $=require('jquery');
var serverUrl='http://'+process.env.npm_package_config_serverName+':'+process.env.npm_package_config_serverPort+'/'; // pulls server/port from package.json
var server=require('http').createServer(function(req,res){
  res.writeHead(404);
  res.end('404 Not Found');
}).listen(process.env.npm_package_config_appPort); // pulls app port from package.json
console.log('running at '+process.env.npm_package_config_appPort);
var walkerOptions={'follow_symlinks':true};
var appDir=__dirname.substring(0,__dirname.lastIndexOf('/'));
appDir=appDir.substring(0,appDir.lastIndexOf('/'));
var vidDir=appDir+'/web/video';
var emitter=walk(vidDir,walkerOptions); // TODO find a walker that targets the http server instead of filesystem
var everyone = nowjs.initialize(server);
var data=null;
var recent=null;
if(typeof localStorage==='undefined'||localStorage===null){ //create db.json if it doesn't already exist
  var Storage=require('dom-storage'); // TODO look into replacing this module with fs.readFileSync call
  localStorage=new Storage(appDir+'/db.json');
  data={
    'name':'toplevel',
    'path':vidDir,
    'url':serverUrl,
    'lastmod':'',
    'subdirs':new Array(),
    'vids':new Array()
  };
}else{ // assume that data variable will be populated if db.json exists
  //localStorage._deleteLocation();
  data=JSON.parse(localStorage.getItem('data'));
  //searchOmdb(_sVidSearch(serverUrl+'episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //searchOmdb(_sVidSearch(serverUrl+'action/Star Trek (2009).mp4'));
  //searchOmdb(_sVidSearch(serverUrl+'action/Inglourious Basterds (2009).mp4'));
  //searchOmdb(vidSearch(serverUrl+'episodes/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
  //searchOmdb(vidSearch(serverUrl+'episodes/The Legend of Korra/The Legend of Korra - S01E03 - The Revelation.mp4'));
}
resetFound(); // sets all dirs/vids found variable to false
if(!localStorage.getItem('recent')){ // create recent variable if it doesn't already exist
  recent={
    'vids':new Array()
  };
}else recent=JSON.parse(localStorage.getItem('recent'));
if(!localStorage.getItem('queue')){ // create queue variable if it doesn't already exist
  queue={
    'vids':new Array()
  };
}else queue=JSON.parse(localStorage.getItem('queue'));
emitter.on('directory',function(dirpath,stat){ // collect directory info
  if(dirpath.indexOf("/.")==-1){ // ignore hidden files
    var dirUrl=dirpath.replace(dirpath.substring(0,dirpath.indexOf('video')),serverUrl);
    //console.log('dirUrl: '+dirUrl);
    var dir=data.find({url:dirUrl});
    if(!dir){ // create new dir object if it doesn't exist
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
      var name=vidpath.substring(vidpath.lastIndexOf('/')+1,vidpath.lastIndexOf('.'));
      vid={
        'name':name,
        'series':parseSeries(name),
        'season':parseSeason(name),
        'episode':parseEpisode(name),
        'title':parseTitle(name),
        'year':parseYear(name),
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
      /*
      // test changes on specific file names
      if(vid.name.match(/Lord\ of\ the\ Rings/)){
        console.log('name: |'+vid.name+'|');
        console.log('series: |'+vid.series+'|');
        console.log('season: |'+vid.season+'|');
        console.log('episode: |'+vid.episode+'|');
        console.log('title: |'+vid.title+'|');
        console.log('year: |'+vid.year+'|');
      }
      */
      var parentUrl=vid.url.substring(0,vid.url.lastIndexOf('/'));
      var parent=data.find({url:parentUrl});
      parent.vids.push(vid); 
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
  //searchOmdb(_sVidSearch('http://webmedsvr:9000/episodes/Breaking Bad/Season05/Breaking Bad - s05e01 - Live Free or Die.mp4'));
  //searchOmdb(_sVidSearch('http://webmedsvr:9000/lane/The Adventures Of Walker And Ping Ping - The Chinese Market (2008).mp4'));
  //searchOmdb(_sVidSearch('http://webmedsvr:9000/lane/Journey To The East - The River Dragon King (2008)/Journey To The East - The River Dragon King (2008) - pt1.mp4'));
  //searchOmdb(_sVidSearch('http://webmedsvr:9000/action/Inglourious Basterds (2009).mp4'));
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
function containsEpisodeStr(vidName){
  var result=false;
  //if(vidName.match(/\s-\s[Ss][0-9]{2,3}[Ee][0-9]{2,3}[Ee]{0,1}[0-9]{0,3}\s-\s/)){ // is episode (ie. contains ' - s00e00 - ')
  if(vidName.match(/[Ss][0-9]{2,3}[Ee][0-9]{2,3}[Ee]{0,1}[0-9]{0,3}/)){ // is episode (ie. contains ' - s00e00 - ')
    result=true;
  }
  return result;
}
function nameSect(vidName){ // returns an array of positions where the separator - can be found
  var indices=[];
  var idx=vidName.indexOf(' - ');
  while(idx!=-1){
    //console.log('nameSect should always be -: '+vidName.charAt(idx+1));
    indices.push(idx+1);
    idx=vidName.indexOf(' - ',idx+1);
  }
  return indices;
}
function parseSeries(vidName){
  var series;
  var indices=nameSect(vidName);
  indices.splice(0,0,0); // insert 0 at beginning of array
  indices.push(vidName.length); // insert last index
  if(indices.length>=4){ // look at names with three or more segments
    if(containsEpisodeStr(vidName)){
      series=vidName.substring(0,vidName.indexOf('-')-1);
    }else{
      for(var i=0;i<indices.length-1;i++){ // for each segment
        if($.isNumeric(vidName.substring(indices[i],indices[i+1]).replace(/[\s-]/g,''))){ // if the current segment is numeric (likely a film number)
          if(indices[i-1]!=null)series=vidName.substring(indices[i-1],indices[i]-1); // set previous segment as series if it exists
        }
      }
    }
  }
  return series;
}
function parseSeason(vidName){
  var season;
  if(vidName.match(/[sS][0-9]{2,3}/)!=null){
    season=vidName.match(/[sS][0-9]{2,3}/)[0];
    season=season.substring(1,season.length);
  }
  return season;
}
function parseEpisode(vidName){
  var episode;
  if(vidName.match(/[eE][0-9]{2,3}/)!=null){
    episode=vidName.match(/[eE][0-9]{2,3}/)[0];
    episode=episode.substring(1,episode.length);
  }
  return episode;
}
function parseTitle(vidName){ // for each section in name, if current matches s00e00 then set title to the next section (taking out possible year)
  var title;
  var indices=nameSect(vidName);
  indices.splice(0,0,0); // insert 0 at beginning of array
  indices.push(vidName.length); // insert last index
  //console.log(indices);
  if(indices.length>=4){ // look at names with three or more segments
    for(var i=0;i<indices.length-1;i++){
      //console.log('parseTitle current segment: |'+vidName.substring(indices[i],indices[i+1])+'| using '+i);
      if(containsEpisodeStr(vidName.substring(indices[i],indices[i+1]))||$.isNumeric(vidName.substring(indices[i],indices[i+1]).replace(/[\s-]/g,''))){ // if current segment containsEpisodeStr or is film number, then set title to next segment
        //console.log('end index of future segment: '+indices[i+2]);
        if(indices[i+2]!=null){ // if there is another segment
          var segment=vidName.substring(indices[i+1]+2,indices[i+2]);
          //console.log('segment: '+segment);
          if(segment.match(/\([0-9]{4}\)/))title=segment.substring(0,segment.indexOf('(')-1); // remove year if present
          else title=segment;
        }else{
          title=vidName.substring(indices[i-1],indices[i]); // else set title to previous segment
          console.log('THIS HAS NOT BEEN TEST YET: '+title);
        }
      }
    }
  }else{
    if(vidName.match(/\([0-9]{4}\)/))title=vidName.substring(0,vidName.indexOf('(')-1); // remove year if present
    else title=vidName;
  }
  return title;
}
function parseYear(vidName){
  var year;
  if(vidName.match(/\([0-9]{4}\)/)!=null){
    year=vidName.match(/\([0-9]{4}\)/)[0];
    year=year.substring(1,year.length-1);
  }
  return year;
}
function searchOmdb(vid){
  // TODO need to handle not finding the vid
  console.log('searchOmdb');
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
        everyone.now.sUpdateVid(vid);
      }
      if(searchResult.Search){
        console.log('multiple results ('+searchResult.Search.length+')');
        vid.omdbResults=searchResult.Search;
        //everyone.now.sUpdateVid(vid);
        //localStorage.setItem('searchResult',JSON.stringify(searchResult));
        everyone.now.sUpdateVid(vid);
      }
      if(searchResult.Title){
        console.log('single result');
        vid.omdb=searchResult;
        //everyone.now.sUpdateVid(vid);
        //localStorage.setItem('searchResult',JSON.stringify(searchResult));
        everyone.now.sUpdateVid(vid);
      }
    });
  }else{ // vid has omdb metadata
    if(vid.omdb!=-1){
      console.log('searchOmdb: vid already has local result');
      console.log(vid.omdb);
      //console.log('local result: '+vid.omdb.Plot);
    }
    if(vid.omdbResults!=-1){
      console.log('searchOmdb: vid already has multiple local results');
      console.log(vid.omdbResults);
    }
    if(vid.omdbError!=-1){
      console.log('searchOmdb: vid already has local omdb error');
      console.log(vid.omdbError);
    }
  }
}
everyone.now.sUpdateVid=function(vid){ // update video by replacing data variable copy with latest vid object from client
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
everyone.now.sAddRecent=function(recentvid){ // add recently played video to recent list
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
everyone.now.sGetData=function(){ // client call to request data variable
  console.log(new Date(),'sGetData from '+this.user.clientId);
  this.now.cGetData(data);
};
everyone.now.sGetRecent=function(){ // client call to request recent variable
  console.log(new Date(),'sGetRecent from '+this.user.clientId);
  this.now.cGetRecent(recent);
}
everyone.now.sGetQueue=function(){ // client call to request queue variable
  console.log(new Date(),'sGetQueue from '+this.user.clientId);
  this.now.cGetQueue(queue);
};
/*
everyone.now.sGetMediaServerUrl=function(){
  this.now.cGetMediaServerUrl(serverUrl);
}
*/
Object.prototype.find=function(urlPair){ // custom find method which allows finding a div or vid object by url 
  var prop,key,val,tRet;
  for(prop in urlPair){
    if(urlPair.hasOwnProperty(prop)){
      key=prop;
      val=urlPair[prop];
    }
  }
  for(prop in this){
    if(prop==key){
      if(this[prop]==val)return this;
    }else if(this[prop] instanceof Object){
      if(this.hasOwnProperty(prop)){
        tRet=this[prop].find(urlPair);
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