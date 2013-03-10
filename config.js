/**@license
 * alveo <https://github.com/joshuapurcell/alveo>
 * Copyright (C) 2013 Joshua Purcell <joshua.purcell@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var encoding='utf-8',
  file='web/index.html',
  fs=require('fs');
var data=JSON.parse(fs.readFileSync('package.json',encoding));
var preText=fs.readFileSync(file,encoding);
var postText=preText.replace(/SERVERNAME/g, data.config.serverName);
var postText=postText.replace(/SERVERPORT/g, data.config.serverPort);
fs.writeFileSync(file,postText,encoding);