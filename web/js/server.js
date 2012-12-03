var sys=require('util'),
    http=require('http'),
    fs=require('fs'),
    //mediaPath='/home/joshua/media/video/episodes/Pokemon',
    findit=require('findit'),
    playlist=new Array(),
    playlistContent="/* THIS IS AN AUTOMATICALLY GENERATED FILE. CONTENT WILL BE MODIFIED BY server.js */\n",
    nowjs=require('now');

var httpServer=http.createServer(function(request,response){
  /*
  console.log("request.url: "+request.url);
  var result = request.url.match(/^\/(.*\.js)/);
  console.log("result: "+result);
  if(result) {
      // Serve JavaScript
      response.writeHead(200, {'Content-Type': 'text/javascript'});
      response.write(readFile(result[1]));
  } else if(request.url.indexOf("add?&id=") != -1){
      // Process video_ids
      var vals = request.url.split("=");
      console.log(vals[vals.length-1]);
      var playlist = fs.openSync("./playlist.csv", "a+");
      fs.writeSync(playlist, ", '" + vals[vals.length -1 ] + "'");
      fs.close(playlist);
  }
  else{
      // Serve index.html
      var ifile = fs.openSync("./playlist.js", "w");
      var icontent = readFile("./playlist.csv");
      var list = "var playlist = [" + icontent + "];\n";
      console.log(list);
      fs.writeSync(ifile, list);
      fs.close(ifile);
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(readFile('index.html'));
  }
  */
  //everyone.now.findFiles(mediaPath);
  //console.log(playlist.length+" files in playlist");
  //var ifile = fs.openSync("./playlist.js", "w");
  //var icontent = readFile("./playlist.csv");
  //var list = "var playlist = [" + icontent + "];\n";
  /*
  playlistContent+="var playlist=[";
  for(var i=0;i<playlist.length;i++){
    playlistContent+="'"+playlist[i]+"',";
  }
  playlistContent=playlistContent.substring(0,playlistContent.length-1);
  playlistContent+="];";
  fs.writeSync(ifile, playlistContent);
  fs.close(ifile);
  */
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(fs.readFileSync('../index.html'));
  response.end();
  console.log("==================================================");
});
httpServer.listen(8888);
console.log('Server running at http://127.0.0.1:8888/');

var everyone = nowjs.initialize(httpServer);
everyone.now.findFiles=function(path){
  console.log(path);
  //if(path==undefined)path=mediaPath;
  findit.find(path,function(file){
    playlist.push(file);
  });
  return playlist;
};
everyone.now.mediaPath='/home/joshua/media/video/episodes/Pokemon';
everyone.now.sendMessage = function(message) {
  everyone.now.receiveMessage(message);
}