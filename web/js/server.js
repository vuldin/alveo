var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now');
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
  fs.readFile('../index.html',function(err,data){
    response.writeHead(200,{'Content-Type':'text/html'});
    response.write(data);
    response.end();
  });
});
server.listen(8888);
console.log('Server running at http://127.0.0.1:8888/');
var everyone = nowjs.initialize(server);
var options={"follow_symlinks":true,"max_depth:":2};
var emitter=walk('../video',options);
var dirs=new Array();
//dirs.sort(sortByPath);
emitter.on('directory',function(dirpath,stat){
  if(dirpath.indexOf("/.")==-1){
    /*
    for(var i=0;i<dirs.length;i++){
      // one directory up
      dirpath.substring(0,dirpath.lastIndexOf("/"));
      // starting dir
      // get from emitter
    }
    */
    var vids=new Array();
    vids.sort(sortByPath);
    var dir={"name":dirpath.substring(dirpath.lastIndexOf("/")+1,dirpath.length),"path":dirpath,"url":dirpath.replace(dirpath.substring(0,dirpath.indexOf("video")+6),mediaserverUrl),"lastmod":stat.atime,"subdirs":new Array(),"vids":vids};
    dirs.push(dir);
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
    dirs[i].vids.sort(function(a,b){
      return a.path.localeCompare(b.path);
    });
  }
  dirs.sort(function(a,b){
    return a.path.localeCompare(b.path);
  });
});
everyone.now.getList=function(){
  everyone.now.createDirectoryList(dirs);
};
function sortByPath(a,b){
  return a.path.localCompare(b.path);
}