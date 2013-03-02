# Web Media Server

The goal of this project is to serve local video content to a variety
of devices. Special attention has been given to the WiiU Browser and
making use of the WiiU Gamepad, but any modern browser will work.
Testing has been done in Firefox, WiiU Browser, and Chrome (in order of
the amount of testing done for each browser). Firefox on Linux still
does not support the H.264 video codec, so some content may be unplayable
on that platform.

Webmedsvr focuses on allowing simultaneous consumption of media content
and its associated metadata across multiple devices. One interesting use case
is watching Game of Thrones while viewing a map of where events take place
and showing comments from other users who have viewed the same content.
Comments from other users would appear in the comment area (on the second
screen device for example) at the relevant time during video playback in a
way similar to soundcloud.com. Highlights include auto-resume of video
playback regardless of device (allowing for a user to seamlessly switch to
another device, video metadata download from external sources (currently
OMDB), custom metadata upload that is shared with other connected clients,
and server-based storage of metadata (mainly due to limitations in the
implementation of local storage on the WiiU Browser).

Webmedsvr uses nodejs and a variety of modules (see node_modules and
web/components). Serving videos from a server running in nodejs has proven
more limiting (so far) than using another external web server like Apache,
so the best working implementation is to run two servers: httpd for
hosting media and nodejs for hosting the webapp. In order for this webapp
to run in its current state, you need enter the URL to a server hosting
your media in web/js/server.js (the mediaserverUrl variable). I'm planning
on permanently switching to a pure nodejs implementation soon (where both
content and the webapp are running from nodejs), but until then there is
an additional needed step: create symbolic links to the folders where
video content is stored on your system. In my case, I have a web/video
folder with the following directories: action, comedy, documentary, drama,
episodes.

The first time the app is started it will build a database of all media
found under web/video (following all symlinks located there) and will be
stored in db.json. This step could take a few seconds depending on how
much media content there is.

# Setup

There are several ways to get this app running on your system. My favorite
way to do this involves using bower:

    npm install -g bower

Then after bower is available

    git clone git://github.com/joshuapurcell/webmedsvr.git webmedsvr
    cd webmedsvr
    bower install jquery jquery-ui popcornjs
    npm install

# Usage

Before starting the app, create the symbolic links inside web/video which
link to your media content (see explanation above). Once this is done,
from the root directory:

    npm start

Webmedsvr will then use the symbolic links you created to build a database
of media content and store this in a file named db.json. The last step (for
now) is to ensure the web server which will host your media content is up
and it's info is stored in the mediaserverUrl variable in
web/js/server.js.

If you would rather use a fully nodejs implementation and see what the
current issues are, then take the following steps:

* comment out the mediaserverUrl and server variables in web/js/server.js
* uncomment the section of server.js starting with the text 'pure node
server'

I have not tested using node for both hosting media content and running
webmedsvr in a while, so it will likely not run without modification.

# Future plans

This project will hopefully be a open webapp that could be found in the
Mozilla marketplace or some other similar webapp market. The potential
roadblock in regard to this is the security limitations of B2G. Only
certified apps (those created by Mozilla and device manufacturers) will
have access to the background service (and other APIs) which will likely
be needed by webmedsvr.

According to Mozilla they have no current plans to allow broader access to
these APIs, but it's still early in development. For more info see:
https://support.mozilla.org/en-US/questions/945629 