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
```` javascript
npm install -g bower
````

Then after bower is available:
``` javascript
git clone git://github.com/joshuapurcell/alveo.git alveo
cd alveo
bower install jquery jquery-ui popcornjs
npm install
````

## Usage
At the moment this app gets information on media content from the local filesystem. You tell the app where to look for your media collection by creating symbolic links inside **web/video** folder (which was created when you ran the `npm install` command earlier). This is a temporary workaround until DLNA server functionality is added.

- Create the symbolic links inside **web/video** which link to your media content
- Update the config section of package.json according to your environment:
  - serverName: hostname of the node server
  - serverPort: port of the node server
  - dlnaServerName: hostname of the DLNA server
  - dlnaServerPort: port of the DLNA server
- Run `npm start` from the root directory

The symbolic links you created will then be used to build a database of your media content which will be stored in a file named db.json. The last step (for now) is to ensure the web server which will host your media content is up.

## Future plans
This project will hopefully be a open webapp that could be found in the Mozilla marketplace or some other similar webapp market. The potential roadblock in regard to this is the security limitations of B2G. Only certified apps (those created by Mozilla and device manufacturers) will have access to the background service (and other APIs) which will likely be needed.

According to Mozilla they have no current plans to allow broader access to these APIs, but it's still early in development. For more info see: https://support.mozilla.org/en-US/questions/945629
