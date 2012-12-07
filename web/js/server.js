var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now'),
    mime=require('mime');
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
  /*
  var pathext=path.substring(path.lastIndexOf('.')+1,path.length);
  var contentTypes = {
    'html': 'text/html',
    'js':   'text/javascript',
    'css':  'text/css',
    'ico':  'image/x-icon'
  };
  for(ext in contentTypes){
    if(pathext==ext)contentType=contentTypes[ext];
  }
  */
  if(path=='/'){
    path='/index.html';
  }
  contentType=mime.lookup(path);
  console.log(path+'\t'+contentType);
  fs.readFile('..'+path,function(err,content){
    response.writeHead(200,{'Content-Type':contentType});
    response.write(content);
    response.end();
  });
  console.log(req.headers['user-agent']);
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
var options={"follow_symlinks":true};
var emitter=walk('../video',options);
var dirs=new Array();
emitter.on('directory',function(dirpath,stat){
  if(dirpath.indexOf("/.")==-1){
    var vids=new Array();
    //vids.sort(sortByPath);
    var dir={"name":dirpath.substring(dirpath.lastIndexOf("/")+1,dirpath.length),"path":dirpath,"url":dirpath.replace(dirpath.substring(0,dirpath.indexOf("video")+6),mediaserverUrl),"lastmod":stat.atime,"subdirs":new Array(),"vids":vids};
    //console.log(dirpath.substring(0,dirpath.lastIndexOf("/")));
    //console.log(dirs[dirs.length].path);
    /*
    if(dirs[dirs.length-1]!=undefined){
      console.log('last:\t\t'+dirs[dirs.length-1].path);
      console.log('current:\t'+dirpath);
      console.log('mod:\t\t'+dirpath.substring(0,dirpath.lastIndexOf("/")));
    }
    */
    var parentFound=false;
    for(var i=0;i<dirs.length;i++){
      //if(dirs[dirs.length-1]!=undefined){
        //console.log('mod:\t\t'+dirpath.substring(0,dirpath.lastIndexOf("/")));
        //console.log('comparing to:\t'+dirs[i].path);
        if(dirpath.substring(0,dirpath.lastIndexOf("/"))==dirs[i].path){
          // parent of current directory matches an existing directory
          console.log('subdir: '+dirpath);
          var subdirs=dirs[i].subdirs;
          subdirs.push(dir);
          parentFound=true;
        }
      //}else dirs.push(dir);
    }
    if(!parentFound){
      console.log('add: '+dirpath);
      dirs.push(dir);
    }
  }
});
emitter.on('file',function(vidpath,stat){
  // ignore hidden files
  if(vidpath.indexOf("/.")==-1){
    var vid={"name":vidpath.substring(vidpath.lastIndexOf("/")+1,vidpath.length),"path":vidpath,"url":vidpath.replace(vidpath.substring(0,vidpath.indexOf("video")+6),mediaserverUrl),"lastmod":stat.atime};
    // find the appropriate collection
    for(i in dirs){
      if(dirs[i].url==vid.url.substring(0,vid.url.lastIndexOf("/"))){
        dirs[i].vids.push(vid);
      }
    }
  }
});
emitter.on('end',function(){
  console.log('dirwalk done');
  for(i in dirs){
    sortDir(dirs[i]);
  }
});
everyone.now.sGetList=function(){
  everyone.now.cCreateDirectoryList(dirs);
};
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