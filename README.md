# alveo
*Many changes related to making use of a DLNA server are in the works. Due to this, the functionality and steps described in this doc doesn't work.*

## Intro
This app allows the creation of time-relevant metadata for media content, and displays both the media and metadata in a meaningful way. One scenario is listening to The Song of Ice and Fire audio books (or watching the Game of Thrones series) while at the same time viewing a map being updated in real-time showing where events are taking place and seeing comments from other users that relate to what is being heard or seen. Two applications which provide related functionality are [Soundcloud](https://soundcloud.com) and Amazon's [X-Ray](http://gizmodo.com/5941067/amazons-x+ray-for-movies-knows-what-youre-watchingand-whos-in-it).

[Popcorn](http://popcornjs.org) is an awesome project, and is used heavily in this application. [Node](http://nodejs.org/) and various modules are also used (see the **node_modules** and **web/components** directories). Special attention has been given to the WiiU browser and Gamepad, but this app is suited for any modern browser. Testing has been done with the following priorities: 1) Firefox, 2) WiiU then 3) Chrome.

## Highlights
- auto-resume of media content on other devices
- use of metadata from external sources (currently OMDB, work in progress)
- sharing of created metadata with other users (if accepted)
- rating of metadata from other sources
- filtering of metadata (block unwanted or useless info, work in progress)
- server-based storage of metadata (see [details](## Storage considerations) below)

## Storage considerations
Server-based storage has been chosen to ensure user-generated information is available to any device a user wants to connect from. Another benefit of this approach is that it doesn't rely on clients to support HTML5 storage (as is currently the case with the WiiU browser).

## Setup
There are several ways to get this app running on your system. My favorite way to do this uses bower:
    npm install -g bower

Then after bower is available:
    git clone git://github.com/joshuapurcell/alveo.git alveo
    cd alveo
    bower install jquery jquery-ui popcornjs
    npm install

## Usage
1. Create the symbolic links inside **web/video** which link to your media content
2. Update the config section of package.json according to your environment:
  - serverName: hostname of the web server hosting content (will be DLNA server in the future)
  - serverPort: port of web server hosting content (will be removed once DLNA server is being used)
  - appPort: port of the node server
3. Run `npm start` from the root directory

The symbolic links you created will then be used to build a database of your media content which will be stored in a file named db.json. The last step (for now) is to ensure the web server which will host your media content is up.

If you would rather use a fully nodejs implementation and see what the current issues are, then take the following steps:
- comment out the mediaserverUrl and server variables in web/js/server.js
- uncomment the section of server.js starting with the text 'pure node server'

I have not tested using node for both hosting media content and the app in a while, so it will likely have issues.

## Future plans
This project will hopefully be a open webapp that could be found in the Mozilla marketplace or some other similar webapp market. The potential roadblock in regard to this is the security limitations of B2G. Only certified apps (those created by Mozilla and device manufacturers) will have access to the background service (and other APIs) which will likely be needed.

According to Mozilla they have no current plans to allow broader access to these APIs, but it's still early in development. For more info see: https://support.mozilla.org/en-US/questions/945629
