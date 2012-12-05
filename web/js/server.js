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
//everyone.now.list=new Array();
var dirs=new Array();
emitter.on('directory',function(dirpath,stat){
  if(dirpath.indexOf("/.")==-1){
    //console.log(dirpath);
    //console.log(stat);
    var target=dirs;
    /*
    for(var i=0;i<dirs.length;i++){
      // one directory up
      dirpath.substring(0,dirpath.lastIndexOf("/"));
      // starting dir
      // get from emitter
    }
    */
    var dir={"name":dirpath.substring(dirpath.lastIndexOf("/")+1,dirpath.length),"path":dirpath.replace(dirpath.substring(0,dirpath.indexOf("video")+6),mediaserverUrl),"lastmod":stat.atime,"subdirs":new Array(),"vids":new Array()};
    console.log(dir.path);
    target.push(dir);
  }
});
emitter.on('file',function(vidpath,stat){
  // ignore hidden files
  if(vidpath.indexOf("/.")==-1){
    var vid={"name":vidpath.substring(vidpath.lastIndexOf("/")+1,vidpath.length),"path":vidpath.replace(vidpath.substring(0,vidpath.indexOf("video")+6),mediaserverUrl),"lastmod":stat.atime};
    // find the appropriate collection
    for(i in dirs){
      console.log('dirpath: '+dirs[i].path);
      console.log('vidpath: '+vid.path.substring(0,vid.path.lastIndexOf("/")));
      if(dirs[i].path==vid.path.substring(0,vid.path.lastIndexOf("/"))){
        dirs[i].vids.push(vid);
        console.log(dirs[i].vids.length);
      }
    }
  }
});
everyone.now.getList=function(){
  everyone.now.createDirectoryList(dirs);
};