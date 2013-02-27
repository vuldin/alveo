# Web Media Server

The goal of this project is to serve local video content to a variety
of devices. Special attention has been given to the WiiU Browser and
making use of the WiiU Gamepad, but any modern browser will work.
Testing has been done in Firefox, WiiU Browser, and Chrome (in order of
the amount of testing done for each browser). Firefox on Linux still
does not support the H.264 video codec, so some content may be unplayable
on that platform.

webmedsvr focuses on allowing simultaneous ingestion of media content
and associated metadata across multiple devices. One interesting use case
is watching Game of Thrones while viewing a map of where events take place
and showing comments from other users who have viewed the same content.
Comments from other users would appear in the comment area (on the second
screen device for example) at the relevant time during video playback.
Highlights include auto-resume of video playback regardless of device
(allowing for a user to seamlessly switch to another device, video
metadata download from external sources (currently OMDB), custom metadata
upload that is shared with other connected clients, and server-based
storage of metadata (mainly due to limitations in implementation of local
storage on the WiiU Browser).

webmedsvr uses nodejs and a variety of modules (see node_modules).
Serving videos from a server running in nodejs has proven more
limiting (so far) than using another external web server like Apache,
so the best working implementation is to run two servers: httpd for
hosting media and nodejs for hosting the webapp. In order for this webapp
to run in its current state, you need enter the URL to a server hosting
your media in web/js/server.js. I'm still hopeful to get a pure nodejs
implementation working soon (where both content and the webapp are running
from nodejs), and due to this there is an additional step which is needed:
create a directory named web/video. Once created, add symbolic links to
the folders where video content is stored on your system. In my case, I
have a web/video folder with the following directories: action, comedy,
documentary, drama, episodes.

The first time the app is started it will build a database of all media
found under web/video (following all symlinks located there) and will be
stored in db.json. This step could take a few seconds depending on how
much media content there is.

# Setup

There are several ways to get this app running on your system. My favorite
way do this involves using bower:

* npm install -g bower

Then after bower is available

* git clone git://github.com/joshuapurcell/webmedsvr.git webmedsvr
* cd webmedsvr
* bower install jquery jquery-ui popcornjs
* npm install

# Usage

From the root directory:

* npm start