var fs=require('fs'),
    walk=require('walkdir');
    nowjs=require('now');
var server=require('http').createServer(function(req,response){
  fs.readFile('../index.html',function(err,data){
    response.writeHead(200,{'Content-Type':'text/html'});
    //response.writeHead(200,{'Content-Type':'video/mp4'});
    response.write(data);
    response.end();
  });
});
server.listen(8888);
console.log('Server running at http://127.0.0.1:8888/');
var everyone = nowjs.initialize(server);
var options={"follow_symlinks":true,"max_depth:":3};
var emitter=walk('../video',options);
//everyone.now.list=new Array();
var dirs=new Array();
emitter.on('directory',function(dirname,stat){
  if(dirname.indexOf("/.")==-1){
    //console.log(dirname);
    //console.log(stat);
    var target=dirs;
    for(var i=0;i<dirs.length;i++)if(dirs[i].path.indexOf(dirname))target=dirs[i].subdirs;
    var dir={"name":dirname.substring(dirname.lastIndexOf("/")+1,dirname.length),"path":dirname,"lastmod":stat.atime,"subdirs":new Array(),"vids":new Array()};
    target.push(dir);
  }
});
//var vids=new Array();
emitter.on('file',function(filename,stat){
  // ignore hidden files
  if(filename.indexOf("/.")==-1){
    var vid={"name":filename.substring(filename.lastIndexOf("/")+1,filename.length),"path":filename,"lastmod":stat.atime};
    //console.log(JSON.stringify(vid));
    // find the appropriate collection 
    for(var i=0;i<dirs.length;i++){
      //console.log('vid.path: '+vid.path.substring(0,filename.lastIndexOf("/")));
      //console.log('filenamesub: '+dirs[i].path);
      if(dirs[i].path==vid.path.substring(0,filename.lastIndexOf("/"))){
        dirs[i].vids.push(vid);
      }
    }
  }
});
everyone.now.getList=function(){
  console.log(dirs);
  //return JSON.stringify(dirs);
  //return dirs;
  everyone.now.createDirectoryList(dirs);
};